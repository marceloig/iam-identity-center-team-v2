#!/usr/bin/env bash


. "./parameters.sh"

if [ -z "$TEAM_ACCOUNT" ]; then 
  export AWS_PROFILE=$ORG_MASTER_PROFILE
else 
  export AWS_PROFILE=$TEAM_ACCOUNT_PROFILE
fi

cognitoUserpoolId=$USER_POOL_ID
cognitoUserpoolDomain=$(aws cognito-idp describe-user-pool --region $REGION --user-pool-id $cognitoUserpoolId --output json | jq -r '.UserPool.Domain')
cognitoUserpoolClientId=$(aws cognito-idp list-user-pool-clients --region $REGION --user-pool-id $cognitoUserpoolId --output json | jq -r '.UserPoolClients[] | select(.ClientName | contains("machine_auth")) | .ClientId')
cognitoUserpoolClient=$(aws cognito-idp describe-user-pool-client --region $REGION --user-pool-id $cognitoUserpoolId --client-id $cognitoUserpoolClientId --output json | jq -r '.UserPoolClient')
graphEndpoint=$(aws appsync list-graphql-apis --region $REGION --output json | jq -r '.graphqlApis[] | select(.name | contains("team-main")) | .uris.GRAPHQL')

echo "token_endpoint=\"https://$cognitoUserpoolDomain.auth.$REGION.amazoncognito.com/oauth2/token\""
echo "graph_endpoint=\"$graphEndpoint\""
echo "client_id=$(echo $cognitoUserpoolClient | jq .ClientId)"
echo "client_secret=$(echo $cognitoUserpoolClient | jq .ClientSecret)"