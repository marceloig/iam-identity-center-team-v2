
import json
import boto3
import os
from botocore.exceptions import ClientError

client = boto3.client('organizations')

def getOUs(id):
    try:
        response = client.list_organizational_units_for_parent(
            ParentId=id,
        )
        results = response["OrganizationalUnits"]
        while "NextToken" in response:
            response = client.list_organizational_units_for_parent(ParentId=id, NextToken=response["NextToken"])
            results.extend(response["OrganizationalUnits"])
        return results
    except ClientError as e:
        print(e.response['Error']['Message'])
        
def get_ou_tree(ou_id):
    ou_list = []
    ous = getOUs(ou_id)
    for ou in ous:
        sub_ous = get_ou_tree(ou["Id"])
        ou["Children"] = sub_ous
        ou_list.append(ou)
    return ou_list

def handler(event, context):
    OUs = client.list_roots().get('Roots')
    root_ou_id = OUs[0].get('Id')
    ou_tree = get_ou_tree(root_ou_id)
    del OUs[0]["PolicyTypes"]
    OUs[0]["Children"] = ou_tree
    
    #OUs = {"ous": json.dumps(OUs)}
    
    print(OUs)
    
    return json.dumps(OUs)
