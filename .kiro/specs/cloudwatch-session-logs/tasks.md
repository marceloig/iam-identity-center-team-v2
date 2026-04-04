# Implementation Plan: CloudWatch Session Logs Migration

## Overview

Migrate session activity log querying from AWS CloudTrail Lake to CloudWatch Logs Insights across two Lambda functions (`teamgetLogs` and `teamqueryLogs`), their resource definitions, IAM policies, and deployment parameters. The frontend and GraphQL schema remain unchanged.

## Tasks

- [x] 1. Update teamgetLogs Lambda to use CloudWatch Logs SDK
  - [x] 1.1 Replace SDK imports and client initialization in `amplify/functions/teamgetLogs/src/index.js`
    - Remove `@aws-sdk/client-cloudtrail` imports (`CloudTrailClient`, `StartQueryCommand`, `DescribeQueryCommand`)
    - Add `@aws-sdk/client-cloudwatch-logs` imports (`CloudWatchLogsClient`, `StartQueryCommand`, `GetQueryResultsCommand`)
    - Replace `CloudTrailClient` instantiation with `CloudWatchLogsClient`
    - Replace `EventDataStore` constant with `CW_LOG_GROUP_NAME` from `process.env.CW_LOG_GROUP_NAME`
    - _Requirements: 1.1, 1.4_

  - [x] 1.2 Implement `buildQueryString` function and update `start_query` in `amplify/functions/teamgetLogs/src/index.js`
    - Extract a `buildQueryString(startTime, endTime, username, role, accountId)` function that returns a CloudWatch Logs Insights query string
    - Query must select `eventID`, `eventName`, `eventSource`, `eventTime`
    - Query must filter `eventTime` between startTime and endTime
    - Query must filter `userIdentity.principalId` with case-insensitive match containing username (using regex `/(?i):<username>/`)
    - Query must filter `userIdentity.sessionContext.sessionIssuer.arn` containing the role
    - Query must filter `recipientAccountId` matching accountId exactly
    - Query must sort by `eventTime` ascending
    - Update `start_query` to convert ISO 8601 timestamps to Unix epoch seconds for the `StartQuery` API `startTime`/`endTime` parameters
    - Preserve existing `idc_` prefix stripping from username
    - Call `StartQueryCommand` with `logGroupName`, `startTime` (epoch), `endTime` (epoch), and `queryString`
    - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 1.3 Update polling logic (`get_query_status`) and handler in `amplify/functions/teamgetLogs/src/index.js`
    - Replace `DescribeQueryCommand` with `GetQueryResultsCommand` for polling
    - Poll while status is `Scheduled` or `Running`
    - On `Complete` status, update Sessions table with queryId via GraphQL mutation (existing `updateItem`)
    - On `Failed`, `Cancelled`, or `Timeout` status, throw an error including the status
    - Add a 1-second delay between poll iterations
    - Handle `ResourceNotFoundException` by logging the error with log group name
    - Allow `LimitExceededException` to propagate so DynamoDB Stream retries the invocation
    - _Requirements: 1.2, 3.1, 3.2, 3.3, 3.4, 9.1, 9.2, 9.3_

  - [ ]* 1.4 Write property test for timestamp conversion (Property 1)
    - **Property 1: Timestamp conversion preserves order**
    - For any pair of valid ISO 8601 datetime strings where startTime < endTime, converting both to Unix epoch seconds produces startEpoch < endEpoch, and both values are non-negative integers
    - Use `fast-check` library
    - **Validates: Requirement 1.3**

  - [ ]* 1.5 Write property test for query builder (Property 2)
    - **Property 2: Query builder produces correct CloudWatch Logs Insights query**
    - For any valid combination of startTime, endTime, username, role, and accountId, the query string selects the correct fields, filters correctly, and sorts by eventTime ascending
    - Use `fast-check` library
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

  - [ ]* 1.6 Write unit tests for teamgetLogs handler
    - Mock `CloudWatchLogsClient` to test polling sequences (Running → Complete, Running → Failed)
    - Test that `updateItem` is called only on `Complete` status
    - Test error thrown on `Failed`/`Cancelled`/`Timeout` status
    - Test `ResourceNotFoundException` logging
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.4, 9.1_

- [x] 2. Checkpoint - Verify teamgetLogs changes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Update teamqueryLogs Lambda to use CloudWatch Logs SDK
  - [x] 3.1 Replace SDK imports and implement result retrieval in `amplify/functions/teamqueryLogs/src/index.js`
    - Remove `@aws-sdk/client-cloudtrail` imports and `CloudTrailClient` instantiation
    - Add `@aws-sdk/client-cloudwatch-logs` imports (`CloudWatchLogsClient`, `GetQueryResultsCommand`)
    - Replace `get_query` function to call `GetQueryResultsCommand` with the queryId (no EventDataStore or pagination needed)
    - Log errors from `GetQueryResults` API
    - _Requirements: 4.1, 4.2, 9.4_

  - [x] 3.2 Implement result transformation logic in `amplify/functions/teamqueryLogs/src/index.js`
    - Transform CloudWatch Logs Insights result format (`[{field, value}]` arrays) to flat objects (`{key: value}`)
    - Exclude fields prefixed with `@` (e.g., `@ptr`, `@timestamp`)
    - Return empty array when query returns no results
    - Produce LogEntry objects with `eventID`, `eventName`, `eventSource`, `eventTime`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 8.4_

  - [ ]* 3.3 Write property test for result transformation (Property 3)
    - **Property 3: Result transformation excludes internal fields and preserves data**
    - For any CloudWatch Logs Insights result array (including empty), the transformer produces flat objects with no `@`-prefixed keys, and empty input produces an empty array
    - Use `fast-check` library
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 8.4**

  - [ ]* 3.4 Write unit tests for teamqueryLogs handler
    - Mock `CloudWatchLogsClient` to test result retrieval and transformation
    - Test with results containing `@ptr` and `@timestamp` fields
    - Test with empty results
    - Test error logging on API failure
    - _Requirements: 4.1, 5.1, 5.2, 5.3, 5.4, 9.4_

- [x] 4. Checkpoint - Verify teamqueryLogs changes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update Lambda resource definitions
  - [x] 5.1 Update `amplify/functions/teamgetLogs/resource.ts`
    - Replace `EVENT_DATA_STORE: process.env.CLOUDTRAIL_AUDIT_LOGS!` with `CW_LOG_GROUP_NAME: process.env.CW_LOG_GROUP_NAME!`
    - _Requirements: 7.3_

  - [x] 5.2 Update `amplify/functions/teamqueryLogs/resource.ts`
    - Remove the `EVENT_DATA_STORE` environment variable entirely
    - _Requirements: 7.4_

- [x] 6. Update IAM policies and environment variables in `amplify/backend.ts`
  - [x] 6.1 Replace CloudTrail IAM policies with CloudWatch Logs policies
    - Update `teamgetLogsPolicyStatement` actions from `cloudtrail:DescribeQuery`, `cloudtrail:StartQuery`, `cloudtrail:GetQueryResults` to `logs:StartQuery`, `logs:GetQueryResults`, `logs:StopQuery`
    - Update `teamqueryLogsPolicyStatement` to replace `cloudtrail:*` actions with `logs:GetQueryResults`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Update deployment parameters and CDK stack
  - [x] 7.1 Update `deployment/parameters.sh`
    - Replace `export CLOUDTRAIL_AUDIT_LOGS="arn:aws:cloudtrail:..."` with `export CW_LOG_GROUP_NAME="<cloudwatch-log-group-name>"`
    - _Requirements: 7.1, 7.2_

  - [x] 7.2 Update `deployment/team/lib/team-stack.ts`
    - Replace the `CLOUDTRAIL_AUDIT_LOGS` environment variable reference in the Amplify branch configuration with `CW_LOG_GROUP_NAME`
    - Update the `this.node.tryGetContext('cloudTrailAuditLogs')` reference to use the new context key
    - _Requirements: 7.1_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The frontend (`src/components/Sessions/Logs.jsx`) and GraphQL schema require no changes (Requirement 8)
- Property tests use `fast-check` as specified in the design document
- Each task references specific requirement clauses for traceability
- The `@aws-sdk/client-cloudwatch-logs` package is included in the AWS SDK v3 and available in the Node.js 22.x Lambda runtime
