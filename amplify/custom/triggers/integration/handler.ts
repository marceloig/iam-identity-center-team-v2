import { CognitoIdentityProviderClient, DescribeUserPoolCommand, ListUserPoolClientsCommand, CreateIdentityProviderCommand, UpdateUserPoolClientCommand } from '@aws-sdk/client-cognito-identity-provider';
import { AmplifyClient, ListAppsCommand, ListDomainAssociationsCommand } from '@aws-sdk/client-amplify';

const USER_POOL_ID = process.env.USER_POOL_ID!;
const CALLBACK_URL = process.env.CALLBACK_URL;

const cognitoClient = new CognitoIdentityProviderClient();
const amplifyClient = new AmplifyClient();

export const handler = async () => {
  try {
    const { userPoolDomain, clientId } = await getCognitoConfig();
    const amplifyDomain = await getAmplifyDomain();
    
    await configureIdentityProvider(clientId, amplifyDomain);
    
    const integrationUrls = getIntegrationUrls(userPoolDomain, clientId, amplifyDomain);
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
  
  const client = UserPoolClients?.find(c => c.ClientName?.includes('amplifyAuthUserPoolAppClient'));
  
  return {
    userPoolDomain: UserPool?.Domain!,
    clientId: client?.ClientId!
  };
}

async function getAmplifyDomain() {
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
  
  return `main.${app.defaultDomain}`;
}

async function configureIdentityProvider(clientId: string, amplifyDomain: string) {
  const callbackUrl = `https://${amplifyDomain}/`;
  
  await cognitoClient.send(
    new CreateIdentityProviderCommand({
      UserPoolId: USER_POOL_ID,
      ProviderName: 'IDC',
      ProviderType: 'SAML',
      ProviderDetails: {
        MetadataURL: process.env.SAML_METADATA_URL || '',
      },
      AttributeMapping: { email: 'Email' },
      IdpIdentifiers: ['team']
    })
  ).catch(e => console.log('Identity provider may already exist:', e.message));
  
  await cognitoClient.send(
    new UpdateUserPoolClientCommand({
      UserPoolId: USER_POOL_ID,
      ClientId: clientId,
      RefreshTokenValidity: 1,
      SupportedIdentityProviders: ['IDC'],
      AllowedOAuthFlows: ['code'],
      AllowedOAuthScopes: ['phone', 'email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
      LogoutURLs: [callbackUrl],
      CallbackURLs: [callbackUrl],
      AllowedOAuthFlowsUserPoolClient: true
    })
  );
}

function getIntegrationUrls(userPoolDomain: string, clientId: string, amplifyDomain: string) {
  const hostedUiDomain = `${userPoolDomain}.auth.${process.env.AWS_REGION}.amazoncognito.com`;
  
  return {
    applicationStartURL: `https://${hostedUiDomain}/authorize?client_id=${clientId}&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://${amplifyDomain}/&idp_identifier=team`,
    applicationACSURL: `https://${hostedUiDomain}/saml2/idpresponse`,
    applicationSAMLAudience: `urn:amazon:cognito:sp:${USER_POOL_ID}`
  };
}
