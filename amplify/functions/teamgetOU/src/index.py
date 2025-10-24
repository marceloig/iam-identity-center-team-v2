
import json
import boto3
from botocore.exceptions import ClientError

client = boto3.client('organizations')


def handler(event, context):
    id = event["arguments"]["id"]
    
    print(id)
    try:
        response = client.list_parents(
            ChildId=id
        )
        return response["Parents"][0]
    except ClientError as e:
        print(e.response['Error']['Message'])
