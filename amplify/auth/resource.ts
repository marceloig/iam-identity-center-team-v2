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
      callbackUrls: [
        process.env.CALLBACK_URL!,
      ],
      logoutUrls: [process.env.CALLBACK_URL!],
    }
  },
  triggers: {
    preTokenGeneration
  }
});
