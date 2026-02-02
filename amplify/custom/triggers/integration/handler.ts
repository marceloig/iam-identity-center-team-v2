import { CognitoIdentityProviderClient, DescribeUserPoolCommand, ListUserPoolClientsCommand, CreateIdentityProviderCommand, UpdateIdentityProviderCommand, UpdateUserPoolClientCommand } from '@aws-sdk/client-cognito-identity-provider';
import { AmplifyClient, ListAppsCommand, ListDomainAssociationsCommand } from '@aws-sdk/client-amplify';

const USER_POOL_ID = process.env.USER_POOL_ID!;
const CALLBACK_URL = process.env.CALLBACK_URL;

const cognitoClient = new CognitoIdentityProviderClient();
const amplifyClient = new AmplifyClient();

export const handler = async () => {
  try {
    const { userPoolDomain, clientId } = await getCognitoConfig();
    const callbackUrl = await getCallbackUrl();
    
    await configureIdentityProvider(clientId, callbackUrl);
    
    const integrationUrls = getIntegrationUrls(userPoolDomain, clientId, callbackUrl);
    console.log('Integration URLs:', integrationUrls);  
    
    return { statusCode: 200, body: integrationUrls };
  } catch (error) {
    console.error('Deployment trigger failed:', error);
    throw error;
  }
};

async function getCognitoConfig() {
  const { UserPool } = await cognitoClient.send(
    new DescribeUserPoolCommand({ UserPoolId: USER_POOL_ID })
  );
  
  const { UserPoolClients } = await cognitoClient.send(
    new ListUserPoolClientsCommand({ UserPoolId: USER_POOL_ID })
  );
  
  const client = UserPoolClients?.find((c: any) => c.ClientName?.includes('amplifyAuthUserPoolAppClient'));
  
  return {
    userPoolDomain: UserPool?.Domain!,
    clientId: client?.ClientId!
  };
}

async function getCallbackUrl() {
  if(CALLBACK_URL) {
    return CALLBACK_URL;
  }
  
  const { apps } = await amplifyClient.send(new ListAppsCommand({}));
  const app = apps?.find(a => a.name === 'TEAM-IDC-APP');
  
  if (!app) throw new Error('Amplify app not found');
  
  const { domainAssociations } = await amplifyClient.send(
    new ListDomainAssociationsCommand({ appId: app.appId })
  );
  
  if (domainAssociations?.length) {
    const domain = domainAssociations[0];
    const subdomain = domain.subDomains?.find(s => s.subDomainSetting?.branchName === 'main');
    const prefix = subdomain?.subDomainSetting?.prefix;
    return prefix ? `${prefix}.${domain.domainName}` : domain.domainName!;
  }
  
  return `https://main.${app.defaultDomain}/`;
}

async function configureIdentityProvider(clientId: string, callbackUrl: string) {
  try {
    await cognitoClient.send(
      new CreateIdentityProviderCommand({
        UserPoolId: USER_POOL_ID,
        ProviderName: `IDC`,
        ProviderType: 'SAML',
        ProviderDetails: {
          MetadataURL: process.env.SAML_METADATA_URL || '',
        },
        AttributeMapping: { email: 'Email' },
        IdpIdentifiers: ['team']
      })
    );
  } catch (e: any) {
    if (e.name === 'DuplicateProviderException') {
      await cognitoClient.send(
        new UpdateIdentityProviderCommand({
          UserPoolId: USER_POOL_ID,
          ProviderName: `IDC`,
          ProviderDetails: {
            MetadataURL: process.env.SAML_METADATA_URL || '',
          },
          AttributeMapping: { email: 'Email' },
          IdpIdentifiers: ['team']
        })
      );
    } else {
      console.error('Error configuring identity provider:', e);
      throw e;
    }
  }
  
  await cognitoClient.send(
    new UpdateUserPoolClientCommand({
      UserPoolId: USER_POOL_ID,
      ClientId: clientId,
      RefreshTokenValidity: 1,
      SupportedIdentityProviders: [`IDC`],
      AllowedOAuthFlows: ['code'],
      AllowedOAuthScopes: ['phone', 'email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
      LogoutURLs: [callbackUrl],
      CallbackURLs: [callbackUrl],
      AllowedOAuthFlowsUserPoolClient: true
    })
  );
}

function getIntegrationUrls(userPoolDomain: string, clientId: string, callbackUrl: string) {
  const hostedUiDomain = `${userPoolDomain}.auth.${process.env.AWS_REGION}.amazoncognito.com`;
  
  return {
    applicationStartURL: `https://${hostedUiDomain}/authorize?client_id=${clientId}&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=${callbackUrl}&idp_identifier=team`,
    applicationACSURL: `https://${hostedUiDomain}/saml2/idpresponse`,
    applicationSAMLAudience: `urn:amazon:cognito:sp:${USER_POOL_ID}`
  };
}
