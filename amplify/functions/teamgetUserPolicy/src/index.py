import json
import uuid
import os
import boto3
from botocore.exceptions import ClientError

policy_table_name = os.getenv("POLICY_TABLE_NAME")
dynamodb = boto3.resource("dynamodb")
policy_table = dynamodb.Table(policy_table_name)

ACCOUNT_ID = os.environ["ACCOUNT_ID"]


def get_mgmt_account_id():
    org_client = boto3.client("organizations")
    try:
        response = org_client.describe_organization()
        return response["Organization"]["MasterAccountId"]
    except ClientError as e:
        print(e.response["Error"]["Message"])


mgmt_account_id = get_mgmt_account_id()


def list_account_for_ou(ouId):
    deployed_in_mgmt = True if ACCOUNT_ID == mgmt_account_id else False
    account = []
    client = boto3.client("organizations")
    try:
        p = client.get_paginator("list_accounts_for_parent")
        paginator = p.paginate(
            ParentId=ouId,
        )

        for page in paginator:
            for acct in page["Accounts"]:
                if not deployed_in_mgmt:
                    if acct["Id"] != mgmt_account_id:
                        account.extend(
                            [{"name": acct["Name"], "id": acct["Id"]}])
                else:
                    account.extend([{"name": acct["Name"], "id": acct["Id"]}])
        return account
    except ClientError as e:
        print(e.response["Error"]["Message"])


def get_entitlements(id):
    response = policy_table.get_item(Key={"id": id})
    return response


def handler(event, context):
    userId = event["arguments"]["userId"]
    groupIds = event["arguments"]["groupIds"]
    username = event["identity"]["username"]
    policy_id = str(uuid.uuid4())
    eligibility = []
    maxDuration = 0

    print("Id: ", policy_id)

    for id in [userId] + groupIds:
        if not id:
            continue
        entitlement = get_entitlements(id)
        print(entitlement)
        if "Item" not in entitlement.keys():
            continue
        duration = entitlement["Item"]["duration"]
        if int(duration) > maxDuration:
            maxDuration = int(duration)
        policy = {}
        policy["accounts"] = entitlement["Item"]["accounts"]

        for ou in entitlement["Item"]["ous"]:
            data = list_account_for_ou(ou["id"])
            policy["accounts"].extend(data)

        policy["permissions"] = entitlement["Item"]["permissions"]
        policy["approvalRequired"] = entitlement["Item"]["approvalRequired"]
        policy["duration"] = str(maxDuration)
        eligibility.append(policy)
    
    result = {"id": policy_id, "policy": eligibility, "username": username}
    print(result)

    return result
