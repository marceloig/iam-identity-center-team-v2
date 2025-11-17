import { Stack } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';

export function createSnsNotificationTopic(stack: Stack) {
  const topic = new sns.Topic(stack, 'TeamNotifications', {
    displayName: `TeamNotifications`,
  });

  return topic;
}