

import boto3
from botocore.exceptions import ClientError


def get_identiy_store_id():
    client = boto3.client('sso-admin')
    try:
        response = client.list_instances()
        return response['Instances'][0]['IdentityStoreId']
    except ClientError as e:
        print(e.response['Error']['Message'])


sso_instance = get_identiy_store_id()


def list_idc_group_membership(groupId):
    try:
        client = boto3.client('identitystore')
        p = client.get_paginator('list_group_memberships')
        paginator = p.paginate(IdentityStoreId=sso_instance,
        GroupId=groupId,
        )
        all_groups=[]
        for page in paginator:
            all_groups.extend(page["GroupMemberships"])
        return all_groups
    except ClientError as e:
        print(e.response['Error']['Message'])
        
def handler(event, context):
    
    members = []
    groupIds = event["arguments"]["groupIds"]
    for groupId in groupIds:
        members.extend(list_idc_group_membership(groupId))
    return {"members": members}