# Requirements Document

## Introduction

This document defines the requirements for migrating session activity log querying from AWS CloudTrail Lake to CloudWatch Logs Insights. The migration replaces the CloudTrail Lake SDK and query engine in two Lambda functions (`teamgetLogs` and `teamqueryLogs`) while preserving the existing GraphQL API contract, frontend behavior, and async query lifecycle (start → poll → retrieve). The change is driven by the sunsetting of CloudTrail Lake by AWS.

## Glossary

- **teamgetLogs_Lambda**: The Lambda function triggered by DynamoDB Streams that starts a CloudWatch Logs Insights query, polls for completion, and updates the Sessions table with the resulting queryId.
- **teamqueryLogs_Lambda**: The Lambda function invoked by the `getLogs` GraphQL query that retrieves completed query results from CloudWatch Logs Insights and returns them as log entries.
- **CloudWatch_Logs_Insights**: The AWS service used to run queries against CloudWatch Log Groups, replacing CloudTrail Lake as the query engine.
- **Query_Builder**: The function responsible for constructing a CloudWatch Logs Insights query string from session parameters (time range, username, role, account ID).
- **Result_Transformer**: The logic that converts CloudWatch Logs Insights field/value result arrays into flat LogEntry objects matching the Logs GraphQL type.
- **Sessions_Table**: The DynamoDB table storing session records, including the `queryId` field updated after a query completes.
- **LogEntry**: An object with fields `eventID`, `eventName`, `eventSource`, and `eventTime` matching the existing Logs GraphQL type.
- **Backend_Configuration**: The `amplify/backend.ts` file defining IAM policies, environment variables, and event source mappings for Lambda functions.
- **Deployment_Parameters**: The `deployment/parameters.sh` shell script exporting environment variables used during deployment.

## Requirements

### Requirement 1: SDK Migration in teamgetLogs Lambda

**User Story:** As a platform engineer, I want the teamgetLogs Lambda to use the CloudWatch Logs SDK instead of the CloudTrail SDK, so that session log queries use the supported CloudWatch Logs Insights engine.

#### Acceptance Criteria

1. WHEN the teamgetLogs_Lambda starts a session log query, THE teamgetLogs_Lambda SHALL use the `StartQuery` API from `@aws-sdk/client-cloudwatch-logs` with the `CW_LOG_GROUP_NAME` environment variable as the log group name
2. WHEN the teamgetLogs_Lambda polls for query completion, THE teamgetLogs_Lambda SHALL use the `GetQueryResults` API from `@aws-sdk/client-cloudwatch-logs` instead of `DescribeQuery` from `@aws-sdk/client-cloudtrail`
3. WHEN the teamgetLogs_Lambda converts session timestamps for the `StartQuery` API, THE teamgetLogs_Lambda SHALL convert ISO 8601 datetime strings to Unix epoch seconds
4. THE teamgetLogs_Lambda SHALL remove all imports and references to `@aws-sdk/client-cloudtrail`

### Requirement 2: Query Construction

**User Story:** As a platform engineer, I want the CloudWatch Logs Insights query to filter on the same dimensions as the original CloudTrail Lake SQL, so that session log results remain equivalent after migration.

#### Acceptance Criteria

1. THE Query_Builder SHALL construct a CloudWatch Logs Insights query that selects the fields `eventID`, `eventName`, `eventSource`, and `eventTime`
2. THE Query_Builder SHALL include a filter on `eventTime` greater than the session start time and less than the session end time
3. THE Query_Builder SHALL include a case-insensitive filter on `userIdentity.principalId` containing the username
4. THE Query_Builder SHALL include a substring filter on `userIdentity.sessionContext.sessionIssuer.arn` containing the role
5. THE Query_Builder SHALL include an exact match filter on `recipientAccountId` matching the account ID
6. THE Query_Builder SHALL sort results by `eventTime` ascending
7. WHEN the username contains the `idc_` prefix, THE teamgetLogs_Lambda SHALL strip the `idc_` prefix before passing the username to the Query_Builder

### Requirement 3: Query Polling and Completion

**User Story:** As a platform engineer, I want the teamgetLogs Lambda to poll CloudWatch Logs Insights until the query completes, so that the Sessions table is updated with a valid queryId only after results are available.

#### Acceptance Criteria

1. WHILE the query status is `Scheduled` or `Running`, THE teamgetLogs_Lambda SHALL continue polling `GetQueryResults`
2. WHEN the query status reaches `Complete`, THE teamgetLogs_Lambda SHALL update the Sessions_Table with the queryId via the GraphQL `updateSessions` mutation
3. IF the query status reaches `Failed`, `Cancelled`, or `Timeout`, THEN THE teamgetLogs_Lambda SHALL throw an error with the query status included in the error message
4. THE teamgetLogs_Lambda SHALL only write the queryId to the Sessions_Table after the query has reached `Complete` status

### Requirement 4: SDK Migration in teamqueryLogs Lambda

**User Story:** As a platform engineer, I want the teamqueryLogs Lambda to use the CloudWatch Logs SDK to retrieve query results, so that log retrieval uses the supported CloudWatch Logs Insights engine.

#### Acceptance Criteria

1. WHEN the teamqueryLogs_Lambda receives a queryId, THE teamqueryLogs_Lambda SHALL call the `GetQueryResults` API from `@aws-sdk/client-cloudwatch-logs`
2. THE teamqueryLogs_Lambda SHALL remove all imports and references to `@aws-sdk/client-cloudtrail`

### Requirement 5: Result Transformation

**User Story:** As a platform engineer, I want CloudWatch Logs Insights results transformed to match the existing Logs GraphQL type, so that the frontend receives data in the same format as before.

#### Acceptance Criteria

1. WHEN the Result_Transformer processes CloudWatch Logs Insights results, THE Result_Transformer SHALL convert each result row from the field/value array format to a flat object with field names as keys
2. WHEN a result row contains fields prefixed with `@`, THE Result_Transformer SHALL exclude those fields from the output LogEntry
3. WHEN the query returns no results, THE Result_Transformer SHALL return an empty array
4. THE Result_Transformer SHALL produce LogEntry objects containing the fields `eventID`, `eventName`, `eventSource`, and `eventTime`

### Requirement 6: IAM Policy Updates

**User Story:** As a platform engineer, I want the IAM policies updated to grant CloudWatch Logs permissions instead of CloudTrail permissions, so that the Lambda functions have least-privilege access to the new query engine.

#### Acceptance Criteria

1. THE Backend_Configuration SHALL grant the teamgetLogs_Lambda IAM permissions for `logs:StartQuery`, `logs:GetQueryResults`, and `logs:StopQuery`
2. THE Backend_Configuration SHALL grant the teamqueryLogs_Lambda IAM permissions for `logs:GetQueryResults`
3. THE Backend_Configuration SHALL remove all `cloudtrail:StartQuery`, `cloudtrail:DescribeQuery`, and `cloudtrail:GetQueryResults` IAM permissions from both Lambda functions
4. THE Backend_Configuration SHALL not grant any IAM permissions beyond `logs:StartQuery`, `logs:GetQueryResults`, and `logs:StopQuery` for session log querying

### Requirement 7: Environment Variable and Deployment Parameter Updates

**User Story:** As a platform engineer, I want the environment variables and deployment parameters updated to reference a CloudWatch Log Group instead of a CloudTrail Event Data Store, so that the configuration is consistent with the new query engine.

#### Acceptance Criteria

1. THE Deployment_Parameters SHALL export `CW_LOG_GROUP_NAME` instead of `CLOUDTRAIL_AUDIT_LOGS`
2. THE Deployment_Parameters SHALL remove the `CLOUDTRAIL_AUDIT_LOGS` export
3. WHEN defining the teamgetLogs_Lambda, THE Lambda resource definition SHALL pass `CW_LOG_GROUP_NAME` as an environment variable instead of `EVENT_DATA_STORE`
4. WHEN defining the teamqueryLogs_Lambda, THE Lambda resource definition SHALL remove the `EVENT_DATA_STORE` environment variable

### Requirement 8: GraphQL Contract Preservation

**User Story:** As a frontend developer, I want the GraphQL API contract to remain unchanged, so that the frontend Logs component continues to work without modifications.

#### Acceptance Criteria

1. THE `getLogs` GraphQL query signature SHALL remain unchanged, accepting a `queryId` string argument and returning an array of `Logs` type
2. THE `Logs` GraphQL custom type SHALL retain the fields `eventName`, `eventSource`, `eventID`, and `eventTime`
3. THE `Sessions` model `queryId` field SHALL remain unchanged
4. WHEN the frontend calls the `getLogs` query, THE teamqueryLogs_Lambda SHALL return data in the same shape as the existing Logs type

### Requirement 9: Error Handling

**User Story:** As a platform engineer, I want robust error handling for CloudWatch Logs Insights query failures, so that transient errors are retried and persistent failures are surfaced.

#### Acceptance Criteria

1. IF the `StartQuery` API throws a `ResourceNotFoundException`, THEN THE teamgetLogs_Lambda SHALL log the error including the log group name
2. IF the `StartQuery` API throws a `LimitExceededException`, THEN THE teamgetLogs_Lambda SHALL allow the DynamoDB Stream retry mechanism to re-invoke the function
3. IF the teamgetLogs_Lambda exceeds its timeout during polling, THEN THE DynamoDB Stream retry mechanism SHALL re-invoke the function up to the configured retry limit
4. IF the `GetQueryResults` API returns an error in teamqueryLogs_Lambda, THEN THE teamqueryLogs_Lambda SHALL log the error details
