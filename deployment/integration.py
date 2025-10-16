import os
import boto3
import parameters as params

def main():
    region = params.REGION
    org_master_profile = params.ORG_MASTER_PROFILE
    team_account_profile = None
    if hasattr(params, 'TEAM_ACCOUNT_PROFILE'):
        team_account_profile = params.TEAM_ACCOUNT_PROFILE

    team_account = os.environ.get('TEAM_ACCOUNT')

    # Set AWS profile
    aws_profile = team_account_profile if team_account and team_account_profile else org_master_profile
    
    try:
        session = boto3.Session(profile_name=aws_profile, region_name=region)
        cognito_client = session.client('cognito-idp')
        amplify_client = session.client('amplify')
    except Exception as e:
        print(f"Error creating AWS session: {e}")
        return

    # Get Cognito User Pool ID
    try:
        user_pools = cognito_client.list_user_pools(MaxResults=10)['UserPools']
        cognito_user_pool_id = next((p['Id'] for p in user_pools if params.USER_POOL_NAME in p['Name']), None)
    except Exception as e:
        print(f"Error listing user pools: {e}")
        return

    if not cognito_user_pool_id:
        print("User pool not found.")
        return

    # Get Cognito User Pool Hosted UI domain
    try:
        user_pool_description = cognito_client.describe_user_pool(UserPoolId=cognito_user_pool_id)
        cognito_user_pool_hosted_ui_domain = user_pool_description['UserPool'].get('Domain')
    except Exception as e:
        print(f"Error describing user pool: {e}")
        return

    if not cognito_user_pool_hosted_ui_domain:
        print("Cognito User Pool Hosted UI domain not found.")
        return
        
    # Get Cognito User Pool Client ID for clientWeb
    try:
        user_pool_clients = cognito_client.list_user_pool_clients(UserPoolId=cognito_user_pool_id)['UserPoolClients']
        cognito_client_web_client_id = next((c['ClientId'] for c in user_pool_clients if 'amplifyAuthUserPoolAppClient' in c['ClientName']), None)
    except Exception as e:
        print(f"Error listing user pool clients: {e}")
        return

    if not cognito_client_web_client_id:
        print("Cognito clientWeb client ID not found.")
        return

    cognito_hosted_ui_domain = f"{cognito_user_pool_hosted_ui_domain}.auth.{region}.amazoncognito.com"

    # Get Amplify App ID and Domain
    try:
        apps = amplify_client.list_apps()['apps']
        team_idc_app = next((a for a in apps if a['name'] == 'TEAM-IDC-APP'), None)
    except Exception as e:
        print(f"Error listing amplify apps: {e}")
        return

    if not team_idc_app:
        print("Amplify app not found.")
        return

    amplify_app_id = team_idc_app['appId']
    amplify_domain = f"main.{team_idc_app['defaultDomain']}"

    # Get Amplify Custom Domain
    try:
        domain_associations = amplify_client.list_domain_associations(appId=amplify_app_id)['domainAssociations']
        if domain_associations:
            custom_domain_info = domain_associations[0]
            amplify_custom_domain = custom_domain_info['domainName']
            sub_domain_settings = custom_domain_info.get('subDomains', [])
            main_branch_setting = next((s['subDomainSetting'] for s in sub_domain_settings if s['subDomainSetting']['branchName'] == 'main'), None)
            if main_branch_setting:
                prefix = main_branch_setting.get('prefix')
                if prefix:
                    amplify_domain = f"{prefix}.{amplify_custom_domain}"
                else:
                    amplify_domain = amplify_custom_domain
    except amplify_client.exceptions.NotFoundException:
        pass # No custom domain associated with the app
    except Exception as e:
        print(f"Error getting amplify custom domain: {e}")

    print(amplify_domain)

    application_start_url = f"https://{cognito_hosted_ui_domain}/authorize?client_id={cognito_client_web_client_id}&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://{amplify_domain}/&idp_identifier=team"
    application_acs_url = f"https://{cognito_hosted_ui_domain}/saml2/idpresponse"
    application_saml_audience = f"urn:amazon:cognito:sp:{cognito_user_pool_id}"

    green = '\033[0;32m'
    clear = '\033[0m'

    print(f"\n{green}applicationStartURL:{clear} {application_start_url}\n{green}applicationACSURL:{clear} {application_acs_url}\n{green}applicationSAMLAudience:{clear} {application_saml_audience}\n\n")

if __name__ == "__main__":
    main()
