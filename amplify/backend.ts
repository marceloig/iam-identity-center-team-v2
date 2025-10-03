import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import {team06dbb7fcPreTokenGenerationHandler} from './functions/team06dbb7fcPreTokenGeneration/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
  auth,
  data,
  team06dbb7fcPreTokenGenerationHandler
});
