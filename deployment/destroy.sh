
#!/usr/bin/env bash

. "./parameters.sh"

if [ -z "$TEAM_ACCOUNT" ]; then 
  export AWS_PROFILE=$ORG_MASTER_PROFILE
else 
  export AWS_PROFILE=$TEAM_ACCOUNT_PROFILE
fi

appId=`aws amplify list-apps --region $REGION --output json | jq -r '.apps[] | select(.name=="TEAM-IDC-APP") | .appId' `
stackName=`aws amplify get-backend-environment --region $REGION --app-id $appId --environment-name main --output json | jq -r '.backendEnvironment | .stackName'`

aws cloudformation delete-stack --region $REGION --stack-name $stackName

aws cloudformation delete-stack --region $REGION --stack-name TEAM-IDC-APP

if [ -z "$SECRET_NAME" ]; then
  aws codecommit delete-repository --region $REGION \--repository-name team-idc-app
fi
