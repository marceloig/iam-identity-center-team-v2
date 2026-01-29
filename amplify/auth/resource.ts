import { defineAuth } from '@aws-amplify/backend';
import { preTokenGeneration } from './pre-token-generation/resource';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      saml: {
        name: 'IDC',
        metadata: {
          metadataContent: process.env.SAML_METADATA_URL || 'https://portal.sso.us-east-1.amazonaws.com',
          metadataType: 'URL',
        },
      }, 
      callbackUrls: [
        process.env.CALLBACK_URL || 'http://localhost:5173',
      ],
      logoutUrls: [process.env.CALLBACK_URL || 'http://localhost:5173'],
    }
  },
  triggers: {
    preTokenGeneration
  }
});
