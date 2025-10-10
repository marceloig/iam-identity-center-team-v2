import { Stack } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';

export function createSnsNotificationTopic(stack: Stack, env: string) {
  const topic = new sns.Topic(stack, 'snsNotificationTopic', {
    displayName: `TeamNotifications-${env}`,
  });

  return topic;
}