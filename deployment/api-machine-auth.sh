#!/usr/bin/env bash

. "./parameters.sh"

if [ -z "$TEAM_ACCOUNT" ]; then 
  export AWS_PROFILE=$ORG_MASTER_PROFILE
else 
  export AWS_PROFILE=$TEAM_ACCOUNT_PROFILE
fi

cognitoUserpoolId=`aws cognito-idp list-user-pools --region $REGION --max-results 10 --output json | jq -r '.UserPools[] | select(.Name | contains("team06dbb7fc")) | .Id'`

# remove pager
export AWS_PAGER=""

# Create the resource server with the needed custom scopes
aws cognito-idp create-resource-server --region $REGION \
--user-pool-id $cognitoUserpoolId \
--identifier "api" \
--name "api" \
--scopes "ScopeName=admin,ScopeDescription=Provides Admin access to machine authentication flows"

# Create the user pool client with a secret access key to allow machine auth
aws cognito-idp create-user-pool-client --region $REGION \
--user-pool-id $cognitoUserpoolId \
--client-name machine_auth \
--generate-secret \
--explicit-auth-flows "ALLOW_REFRESH_TOKEN_AUTH" \
--supported-identity-providers "COGNITO" \
--callback-urls "https://localhost" \
--allowed-o-auth-flows "client_credentials" \
--allowed-o-auth-scopes "api/admin" \
--allowed-o-auth-flows-user-pool-client