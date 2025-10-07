import { Stack } from 'aws-cdk-lib';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import { Fn } from 'aws-cdk-lib';

export function createCloudTrailLake(stack: Stack, cloudTrailAuditLogs: string = 'read') {
  const isOrganizationsSupported = !Fn.conditionEquals(stack.partition, 'aws-cn');
  const isReadAndWriteEnabled = Fn.conditionEquals(cloudTrailAuditLogs, 'read_write');
  const isReadOnlyEnabled = Fn.conditionEquals(cloudTrailAuditLogs, 'read');
  const isAuditLogsDisabled = Fn.conditionEquals(cloudTrailAuditLogs, 'none');
  
  const createEventDataStore = Fn.conditionOr(
    isAuditLogsDisabled,
    isReadOnlyEnabled,
    isReadAndWriteEnabled,
    Fn.conditionEquals(cloudTrailAuditLogs, 'write')
  );

  const eventDataStore = new cloudtrail.CfnEventDataStore(stack, 'myEventDataStore', {
    name: stack.stackName,
    multiRegionEnabled: true,
    ingestionEnabled: Fn.conditionIf('IsAuditLogsDisabled', false, true),
    retentionPeriod: 7,
    organizationEnabled: Fn.conditionIf('IsOrganizationsSupported', true, Fn.ref('AWS::NoValue')),
    terminationProtectionEnabled: false,
    advancedEventSelectors: [
      Fn.conditionIf('IsReadAndWriteEnabled', 
        {
          fieldSelectors: [
            {
              field: 'eventCategory',
              equals: ['Management']
            }
          ]
        },
        {
          fieldSelectors: [
            {
              field: 'readOnly',
              equals: [Fn.conditionIf('IsReadOnlyEnabled', true, false)]
            },
            {
              field: 'eventCategory',
              equals: ['Management']
            }
          ]
        }
      )
    ]
  });

  return {
    eventDataStoreId: Fn.conditionIf('CreateEventDataStore', eventDataStore.ref, cloudTrailAuditLogs)
  };
}