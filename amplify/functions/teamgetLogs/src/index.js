//  © 2023 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.
//  This AWS Content is provided subject to the terms of the AWS Customer Agreement available at
//  http: // aws.amazon.com/agreement or other written agreement between Customer and either
//  Amazon Web Services, Inc. or Amazon Web Services EMEA SARL or both.

/* Amplify Params - DO NOT EDIT
	API_TEAM_GRAPHQLAPIENDPOINTOUTPUT
	API_AWSPIM_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
import crypto from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { default as fetch, Request } from 'node-fetch';

import {
  CloudWatchLogsClient,
  StartQueryCommand,
  GetQueryResultsCommand,
} from "@aws-sdk/client-cloudwatch-logs"

const { Sha256 } = crypto;
const REGION = process.env.REGION;
const CW_LOG_GROUP_NAME = process.env.CW_LOG_GROUP_NAME;
const GRAPHQL_ENDPOINT = process.env.API_TEAM_GRAPHQLAPIENDPOINTOUTPUT;

const client = new CloudWatchLogsClient({ region: REGION });

const query = /* GraphQL */ `
  mutation UpdateSessions(
    $input: UpdateSessionsInput!
    $condition: ModelSessionsConditionInput
  ) {
    updateSessions(input: $input, condition: $condition) {
      id
      startTime
      endTime
      username
      accountId
      role
      approver_ids
      queryId
      createdAt
      updatedAt
      owner
    }
  }
`;

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const updateItem = async (id, queryId) => {
  const variables = {
    input: {
      id: id,
      queryId: queryId
    } 
  }

  const endpoint = new URL(GRAPHQL_ENDPOINT);

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: REGION,
    service: 'appsync',
    sha256: Sha256
  });

  const requestToBeSigned = new HttpRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      host: endpoint.host
    },
    hostname: endpoint.host,
    body: JSON.stringify({ query, variables }),
    path: endpoint.pathname
  });

  const signed = await signer.sign(requestToBeSigned);
  const request = new Request(endpoint, signed);

  let statusCode = 200;
  let body;
  let response;

  try {
    response = await fetch(request);
    body = await response.json();
    console.log(body);
    if (body.errors) statusCode = 400;
  } catch (error) {
    statusCode = 400;
    body = {
      errors: [
        {
          status: response.status,
          message: error.message,
          stack: error.stack
        }
      ]
    };
  }

  return {
    statusCode,
    body: JSON.stringify(body)
  };
};


const get_query_status = async (queryId) => {
  const input = {
    queryId: queryId,
  };
  const command = new GetQueryResultsCommand(input);
  const response = await client.send(command);
  return response.status;
};

export const buildQueryString = (startTime, endTime, username, role, accountId) => {
  return `fields eventID, eventName, eventSource, eventTime
| filter eventTime > "${startTime}" and eventTime < "${endTime}"
| filter userIdentity.principalId like /(?i):${username}/
| filter userIdentity.sessionContext.sessionIssuer.arn like /${role}/
| filter recipientAccountId = "${accountId}"
| sort eventTime asc`;
};

const start_query = async (event) => {
  const startTime = event["startTime"]["S"];
  const endTime = event["endTime"]["S"];
  const username = event["username"]["S"].replace('idc_', '');
  const accountId = event["accountId"]["S"];
  const role = event["role"]["S"];
  try {
    const startEpoch = Math.floor(new Date(startTime).getTime() / 1000);
    const endEpoch = Math.floor(new Date(endTime).getTime() / 1000);
    const queryString = buildQueryString(startTime, endTime, username, role, accountId);
    const input = {
      logGroupName: CW_LOG_GROUP_NAME,
      startTime: startEpoch,
      endTime: endEpoch,
      queryString: queryString,
    };
    const command = new StartQueryCommand(input);
    const response = await client.send(command);
    return response.queryId;
  } catch (err) {
    console.log("Error", err);
  }
};

export const handler = async (event) => {
  let data = event["Records"].pop()
  data = data["dynamodb"]["NewImage"]
  const id = data["id"]["S"]
  console.log("Event", data);

  try {
    const queryId = await start_query(data);
    let status = 'Running';

    while (status === 'Running' || status === 'Scheduled') {
      const currentStatus = await get_query_status(queryId);
      status = currentStatus;
      console.log("Query status:", status);

      if (status === 'Complete') {
        console.log("query Complete - queryId:", queryId);
        const response = await updateItem(id, queryId);
        return response;
      }

      if (status === 'Failed' || status === 'Cancelled' || status === 'Timeout') {
        throw new Error(`Query failed with status: ${status}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') {
      console.log(`ResourceNotFoundException: Log group '${CW_LOG_GROUP_NAME}' not found.`, err);
      return;
    }
    throw err;
  }
};