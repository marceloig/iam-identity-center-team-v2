// © 2023 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.
// This AWS Content is provided subject to the terms of the AWS Customer Agreement available at
// http://aws.amazon.com/agreement or other written agreement between Customer and either
// Amazon Web Services, Inc. or Amazon Web Services EMEA SARL or both.
import { generateClient } from 'aws-amplify/api';

const client = generateClient();
import {
  getAccounts,
  getPermissions,
  getApprovers,
  listRequests,
  getRequests,
  getSessions,
  listApprovers,
  getLogs,
  getOUs,
  getOU,
  requestByEmailAndStatus,
  getIdCGroups,
  getUsers,
  listEligibilities,
  getEligibility,
  listGroups,
  getSettings,
  getMgmtPermissions,
  getUserPolicy
} from "../../graphql/queries";
import {
  createRequests,
  createSessions,
  deleteSessions,
  updateRequests,
  createApprovers,
  deleteApprovers,
  updateApprovers,
  createEligibility,
  deleteEligibility,
  updateEligibility,
  createSettings,
  updateSettings
} from "../../graphql/mutations";

export async function fetchAccounts() {
  try {
    const accounts = await client.graphql({ query: getAccounts });
    const data = await accounts.data.getAccounts;
    return data;
  } catch (err) {
    console.log("error fetching accounts");
  }
}

export async function fetchPermissions() {
  try {
    const permissions = await client.graphql({ query: getPermissions });
    const data = await permissions.data.getPermissions;
    return data;
  } catch (err) {
    console.log("error fetching permissions", err);
  }
}

export async function getMgmtAccountPs() {
  try {
    const permissions = await client.graphql({ query: getMgmtPermissions });
    const data = await permissions.data.getMgmtPermissions;
    return data;
  } catch (err) {
    console.log("error fetching permissions");
  }
}

export async function getUserRequests(email) {
  let nextToken = null;
  let data = [];
  try {
    do {
    const requests = await client.graphql({
      query: requestByEmailAndStatus,
      variables: { email: email, nextToken }
    });
    data = data.concat(requests.data.requestByEmailAndStatus.items);
    nextToken = requests.data.requestByEmailAndStatus.nextToken;
  } while (nextToken);
    return data;
  } catch (err) {
    console.log("error fetching requests");
    return {"error":err}
  }
}

export async function fetchOUs() {
  try {
    const OU = await client.graphql({ query: getOUs });
    const data = await OU.data.getOUs;
    return data;
  } catch (err) {
    console.log("error fetching OUs");
    return {"error":err}
  }
}

export async function fetchOU(id) {
  try {
    const OU = await client.graphql({
      query: getOU,
      variables: { id: id }
    });
    const data = await OU.data.getOU;
    return data;
  } catch (err) {
    console.log("error fetching OU");
  }
}
export async function getGroupMemberships(id) {
  try {
    const members = await client.graphql({
      query: listGroups,
      variables: { groupIds: id }
    });
    const data = await members.data.listGroups;
    return data;
  } catch (err) {
    console.log("error fetching members");
  }
}

export async function fetchIdCGroups() {
  try {
    const groups = await client.graphql({ query: getIdCGroups });
    const data = await groups.data.getIdCGroups;
    return data;
  } catch (err) {
    console.log("error fetching IdC Groups");
  }
}

export async function fetchUsers() {
  try {
    const groups = await client.graphql({ query: getUsers });
    const data = await groups.data.getUsers;
    return data;
  } catch (err) {
    console.log("error fetching IdC Groups");
  }
}

export async function getSessionList() {
  let nextToken = null;
  let data = [];
  try {
    do {
    const request = await client.graphql({
      query: listRequests,
      variables: { nextToken }
    });
    data = data.concat(request.data.listRequests.items);
    nextToken = request.data.listRequests.nextToken;
  } while (nextToken);
    return data;
  } catch (err) {
    console.log("error fetching sessions");
    return {"error":err}
  }
}

export async function getRequest(id) {
  try {
    const request = await client.graphql({
      query: getRequests,
      variables: { id: id }
    });
    const data = await request.data.getRequests;
    return data;
  } catch (err) {
    console.log("error fetching request");
  }
}

export async function getAllApprovers() {
  let nextToken = null;
  let data = [];
  try {
    do{
    const request = await client.graphql({
      query: listApprovers,
      variables: { nextToken }
    });
    data = data.concat(request.data.listApprovers.items);
    nextToken = request.data.listApprovers.nextToken;
    } while (nextToken);
    return data;
  } catch (err) {
    console.log("error fetching approvers");
    return {"error":err}
  }
}

export async function sessions(filter) {
  let nextToken = null;
  let data = [];
  try {
    do {
    const request = await client.graphql({
      query: listRequests,
      variables: { filter: filter, nextToken }
    });
    data = data.concat(request.data.listRequests.items);
    nextToken = request.data.listRequests.nextToken;
  } while (nextToken);
    return data;
  } catch (err) {
    console.log("error fetching sessions");
    return {"error":err}
  }
}

export async function fetchLogs(args) {
  try {
    const logs = await client.graphql({ query: getLogs, variables: args });
    const data = await logs.data.getLogs;
    return data;
  } catch (err) {
    console.log("error fetching logs");
  }
}

export async function fetchPolicy(args) {
  try {
    const entitlement = await client.graphql({ query: getUserPolicy, variables: args });
    const data = await entitlement.data.getUserPolicy;
    return data;
  } catch (err) {
    console.log("error fetching Entitlement");
  }
}


// Mutations
export async function updateStatus(data) {
  try {
    const req = await client.graphql({
      query: updateRequests,
      variables: { input: data }
    });
    return req.data.updateRequests;
  } catch (err) {
    console.log("error updating status");
  }
}

export async function requestTeam(data) {
  try {
    const req = await client.graphql({
      query: createRequests,
      variables: { input: data }
    });
    return req.data.createRequests.id;
  } catch (err) {
    console.log("error creating request");
  }
}
export async function getSessionLogs(data) {
  try {
    const req = await client.graphql({
      query: createSessions,
      variables: { input: data }
    });
    return req.data.createSessions.id;
  } catch (err) {
    console.log("error creating session Logs");
  }
}

export async function deleteSessionLogs(data) {
  try {
    const req = await client.graphql({
      query: deleteSessions,
      variables: { input: data }
    });
    return req.data.deleteSessions;
  } catch (err) {
    console.log("error deleting session log");
  }
}

export async function getSession(id) {
  try {
    const request = await client.graphql({
      query: getSessions,
      variables: { id: id }
    });
    const data = await request.data.getSessions;
    return data;
  } catch (err) {
    console.log("error fetching session log");
  }
}

export async function addApprovers(data) {
  try {
    const req = await client.graphql({
      query: createApprovers,
      variables: { input: data }
    });
    return req.data.createApprovers.Id;
  } catch (err) {
    console.log("error adding Approvers");
  }
}

export async function delApprover(data) {
  try {
    const req = await client.graphql({
      query: deleteApprovers,
      variables: { input: data }
    });
    return req.data.deleteApprovers;
  } catch (err) {
    console.log("error deleting approver");
  }
}

export async function editApprover(data) {
  try {
    const req = await client.graphql({
      query: updateApprovers,
      variables: { input: data }
    });
    return req.data.updateApprovers;
  } catch (err) {
    console.log("error updating approver");
  }
}

export async function fetchApprovers(id, type) {
  try {
    const approver = await client.graphql({
      query: getApprovers,
      variables: { id: id, type: type }
    });
    const data = await approver.data.getApprovers;
    return data;
  } catch (err) {
    console.log("error fetching approvers");
  }
}

export async function addPolicy(data) {
  try {
    const req = await client.graphql({
      query: createEligibility,
      variables: { input: data }
    });
    return req.data.createEligibility.id;
  } catch (err) {
    console.log("error creating policy");
  }
}

export async function delPolicy(data) {
  try {
    const req = await client.graphql({
      query: deleteEligibility,
      variables: { input: data }
    });
    return req.data.deleteEligibility;
  } catch (err) {
    console.log("error deleting policy");
  }
}

export async function editPolicy(data) {
  try {
    const req = await client.graphql({
      query: updateEligibility,
      variables: { input: data }
    });
    return req.data.updateEligibility;
  } catch (err) {
    console.log("error updating policy");
  }
}

export async function fetchEligibility(id) {
  try {
    const approver = await API.graphql(
      graphqlOperation(getEligibility, {
        id: id,
      })
    );
    const data = await approver.data.getEligibility;
    return data;
  } catch (err) {
    console.log("error fetching eligibility");
  }
}

export async function getAllEligibility() {
  let nextToken = null;
  let data = [];
  try {
    do {
    const request = await API.graphql(graphqlOperation(listEligibilities, {
      nextToken
    }));
    data = data.concat(request.data.listEligibilities.items);
    nextToken = request.data.listEligibilities.nextToken;
  } while (nextToken);
    return data;
  } catch (err) {
    console.log("error fetching eligibility");
    return {"error":err}
  }
}

export async function getSetting(id) {
  try {
    const request = await API.graphql(
      graphqlOperation(getSettings, {
        id: id,
      })
    );
    let data = await request.data.getSettings;
    return data;
  } catch (err) {
    console.log("error fetching settings");
  }
}

export async function createSetting(data) {
  try {
    const req = await API.graphql(
      graphqlOperation(createSettings, { input: data })
    );
    return req.data.createSettings.id;
  } catch (err) {
    console.log("error creating settings");
  }
}
export async function updateSetting(data) {
  try {
    const req = await API.graphql(
      graphqlOperation(updateSettings, { input: data })
    );
    return req.data.updateSettings;
  } catch (err) {
    console.log("error updating settings");
  }
}

export async function revokePim(data) {
  try {
    updateRequests(data).then(() => {});
  } catch (err) {
    console.log("error revoking request");
  }
}
