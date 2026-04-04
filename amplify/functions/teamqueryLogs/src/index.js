//  © 2023 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.
//  This AWS Content is provided subject to the terms of the AWS Customer Agreement available at
//  http: // aws.amazon.com/agreement or other written agreement between Customer and either
//  Amazon Web Services, Inc. or Amazon Web Services EMEA SARL or both.
const REGION = process.env.REGION;
const {
    CloudWatchLogsClient,
    GetQueryResultsCommand,
  } = require("@aws-sdk/client-cloudwatch-logs");
  const client = new CloudWatchLogsClient({ region: REGION });

/**
 * Transforms CloudWatch Logs Insights result rows from [{field, value}] arrays
 * to flat objects, excluding fields prefixed with @ (e.g., @ptr, @timestamp).
 */
const transformResults = (results) => {
  if (!results || results.length === 0) {
    return [];
  }
  const output = [];
  for (const row of results) {
    const logEntry = {};
    for (const fieldValue of row) {
      if (!fieldValue.field.startsWith('@')) {
        logEntry[fieldValue.field] = fieldValue.value;
      }
    }
    output.push(logEntry);
  }
  return output;
};

const get_query = async (queryId) => {
  try {
    const command = new GetQueryResultsCommand({ queryId });
    const response = await client.send(command);
    const output = transformResults(response.results);
    console.log(output);
    return output;
  } catch (err) {
    console.log("Error", err);
    return [];
  }
};

exports.handler = async (event) => {
    const queryId = event["arguments"]["queryId"]
    return get_query(queryId);
};
