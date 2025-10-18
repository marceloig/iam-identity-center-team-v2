import type { PreTokenGenerationTriggerHandler } from "aws-lambda";

import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { SSOAdminClient, ListInstancesCommand } from "@aws-sdk/client-sso-admin";
import { IdentitystoreClient, GetUserIdCommand, GetGroupIdCommand, ListGroupMembershipsForMemberCommand } from "@aws-sdk/client-identitystore";
import { unmarshall } from "@aws-sdk/util-dynamodb";
//import { env } from '$amplify/env/pre-token-generation'; // the import is '$amplify/env/<function-name>'

const settingsTableName = process.env.SETTINGS_TABLE_NAME;
const dynamodb = new DynamoDBClient({});
const ssoAdmin = new SSOAdminClient({});
const identitystore = new IdentitystoreClient({});

async function getSettings() {
    const command = new GetItemCommand({
        TableName: settingsTableName,
        Key: {
            id: { S: "settings" },
        },
    });
    const response = await dynamodb.send(command);
    return response.Item ? unmarshall(response.Item) : {};
}

async function getTeamGroups() {
    try {
        const settings = await getSettings();
        const teamAdminGroup = settings.teamAdminGroup || process.env.TEAM_ADMIN_GROUP;
        const teamAuditorGroup = settings.teamAuditorGroup || process.env.TEAM_AUDITOR_GROUP;
        return { teamAdminGroup, teamAuditorGroup };
    } catch (e) {
        console.error(`Error retrieving TEAM settings from database: ${e}`);
        return { teamAdminGroup: process.env.TEAM_ADMIN_GROUP, teamAuditorGroup: process.env.TEAM_AUDITOR_GROUP };
    }
}

async function getIdentityStoreId() {
    try {
        const command = new ListInstancesCommand({});
        const response = await ssoAdmin.send(command);
        return response.Instances?.[0]?.IdentityStoreId;
    } catch (e) {
        console.error(e);
    }
}

async function getUser(ssoInstance: string, username: string) {
    try {
        const command = new GetUserIdCommand({
            IdentityStoreId: ssoInstance,
            AlternateIdentifier: {
                UniqueAttribute: {
                    AttributePath: "userName",
                    AttributeValue: username,
                },
            },
        });
        const response = await identitystore.send(command);
        return response.UserId;
    } catch (e) {
        console.error(e);
    }
}

async function getGroup(ssoInstance: string, group: string) {
    try {
        const command = new GetGroupIdCommand({
            IdentityStoreId: ssoInstance,
            AlternateIdentifier: {
                UniqueAttribute: {
                    AttributePath: "DisplayName",
                    AttributeValue: group,
                },
            },
        });
        const response = await identitystore.send(command);
        return response.GroupId;
    } catch (e) {
        console.error(e);
    }
}

async function listIdcGroupMembership(ssoInstance: string, userId: string) {
    try {
        const command = new ListGroupMembershipsForMemberCommand({
            IdentityStoreId: ssoInstance,
            MemberId: {
                UserId: userId,
            },
        });
        const response = await identitystore.send(command);
        return response.GroupMemberships;
    } catch (e) {
        console.error(e);
    }
}

export const handler: PreTokenGenerationTriggerHandler = async (event) => {
    const { teamAdminGroup, teamAuditorGroup } = await getTeamGroups();
    const ssoInstance = await getIdentityStoreId() || "";

    const user = event.userName.split("_", 2)[1];
    const userId = await getUser(ssoInstance, user);
    const admin = await getGroup(ssoInstance, teamAdminGroup);
    const auditor = await getGroup(ssoInstance, teamAuditorGroup);
    const groups = [];
    let groupIds = "";

    const groupData = await listIdcGroupMembership(ssoInstance, userId || "");

    if (groupData) {
        for (const group of groupData) {
            groupIds += group.GroupId + ",";
            if (group.GroupId === admin) {
                groups.push("Admin");
            } else if (group.GroupId === auditor) {
                groups.push("Auditors");
            }
        }
    }

    event.response = {
        claimsOverrideDetails: {
            claimsToAddOrOverride: {
                userId: userId || "",
                groupIds: groupIds,
                groups: groups.join(","),
            },
            groupOverrideDetails: {
                groupsToOverride: groups,
            },
        },
    };

    return event;
};