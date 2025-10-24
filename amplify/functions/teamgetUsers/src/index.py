
from botocore.exceptions import ClientError
import boto3
from operator import itemgetter

def get_identiy_store_id():
    client = boto3.client('sso-admin')
    try:
        response = client.list_instances()
        return response['Instances'][0]['IdentityStoreId']
    except ClientError as e:
        print(e.response['Error']['Message'])


sso_instance = get_identiy_store_id()
        
def list_idc_users(IdentityStoreId):
    try:
        client = boto3.client('identitystore')
        p = client.get_paginator('list_users')
        paginator = p.paginate(IdentityStoreId=IdentityStoreId)
        all_users = []
        for page in paginator:
            all_users.extend(page["Users"])
        return sorted(all_users, key=itemgetter('UserName'))
    except ClientError as e:
        print(e.response['Error']['Message'])


def handler(event, context):
    return list_idc_users(sso_instance)
