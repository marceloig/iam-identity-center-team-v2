import os
import json
import boto3
import parameters as params

def main():
    region = params.REGION
    if not region:
        print("Error: REGION not found in parameters.py")
        return

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
        cognito_user_pool_id = next((p['Id'] for p in user_pools if 'amplifyAuthUserPool' in p['Name']), None)
    except Exception as e:
        print(f"Error listing user pools: {e}")
        return

    if not cognito_user_pool_id:
        print("User pool not found.")
        return

    # Get Cognito User Pool Client ID
    try:
        user_pool_clients = cognito_client.list_user_pool_clients(UserPoolId=cognito_user_pool_id)['UserPoolClients']
        client_id = next((c['ClientId'] for c in user_pool_clients if 'amplifyAuthUserPoolAppClient' in c['ClientName']), None)
    except Exception as e:
        print(f"Error listing user pool clients: {e}")
        return

    if not client_id:
        print("User pool client not found.")
        return

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


    # Create Identity Provider
    details_file = 'details.json'
    if not os.path.exists(details_file):
        print(f"Error: {details_file} not found.")
        return

    with open(details_file, 'r') as f:
        try:
            provider_details = json.load(f)
        except json.JSONDecodeError:
            print(f"Error: Could not decode JSON from {details_file}")
            return

    try:
        cognito_client.create_identity_provider(
            UserPoolId=cognito_user_pool_id,
            ProviderName='IDC',
            ProviderType='SAML',
            ProviderDetails=provider_details,
            AttributeMapping={'email': 'Email'},
            IdpIdentifiers=['team']
        )
    except cognito_client.exceptions.DuplicateProviderException:
        print("Identity provider 'IDC' already exists.")
    except Exception as e:
        print(f"Error creating identity provider: {e}")


    # Update User Pool Client
    try:
        cognito_client.update_user_pool_client(
            UserPoolId=cognito_user_pool_id,
            ClientId=client_id,
            RefreshTokenValidity=1,
            SupportedIdentityProviders=['IDC'],
            AllowedOAuthFlows=['code'],
            AllowedOAuthScopes=['phone', 'email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
            LogoutURLs=[f'https://{amplify_domain}/'],
            CallbackURLs=[f'https://{amplify_domain}/'],
            AllowedOAuthFlowsUserPoolClient=True
        )
        print("Cognito configuration updated successfully.")
    except Exception as e:
        print(f"Error updating user pool client: {e}")

if __name__ == "__main__":
    main()
