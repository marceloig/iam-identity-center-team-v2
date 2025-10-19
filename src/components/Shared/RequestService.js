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
    console.error("error fetching permissions", err);
  }
}

export async function getMgmtAccountPs() {
  try {
    const permissions = await client.graphql({ query: getMgmtPermissions });
    const data = await permissions.data.getMgmtPermissions;
    return data;
  } catch (err) {
    console.error("error fetching permissions", err);
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
    console.error("error fetching requests", err);
    return {"error":err}
  }
}

export async function fetchOUs() {
  try {
    const OU = await client.graphql({ query: getOUs });
    const data = await OU.data.getOUs;
    return data;
  } catch (err) {
    console.error("error fetching OUs", err);
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
    console.error("error fetching OU", err);
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
    console.error("error fetching members", err);
  }
}

export async function fetchIdCGroups() {
  try {
    const groups = await client.graphql({ query: getIdCGroups });
    const data = await groups.data.getIdCGroups;
    return data;
  } catch (err) {
    console.error("error fetching IdC Groups", err);
  }
}

export async function fetchUsers() {
  try {
    const groups = await client.graphql({ query: getUsers });
    const data = await groups.data.getUsers;
    return data;
  } catch (err) {
    console.error("error fetching IdC Groups", err);
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
    console.error("error fetching sessions", err);
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
    console.error("error fetching request", err);
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
    console.error("error fetching approvers", err);
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
    console.error("error fetching sessions", err);
    return {"error":err}
  }
}

export async function fetchLogs(args) {
  try {
    const logs = await client.graphql({ query: getLogs, variables: args });
    const data = await logs.data.getLogs;
    return data;
  } catch (err) {
    console.error("error fetching logs", err);
  }
}

export async function fetchPolicy(args) {
  try {
    const entitlement = await client.graphql({ query: getUserPolicy, variables: args });
    const data = await entitlement.data.getUserPolicy;
    return data;
  } catch (err) {
    console.error("error fetching Entitlement", err);
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
    console.error("error updating status", err);
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
    console.error("error creating request", err);
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
    console.error("error creating session Logs", err);
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
    console.error("error deleting session log", err);
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
    console.error("error fetching session log", err);
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
    console.error("error adding Approvers", err);
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
    console.error("error deleting approver", err);
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
    console.error("error updating approver", err);
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
    console.error("error fetching approvers", err);
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
    console.error("error creating policy", err);
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
    console.error("error deleting policy", err);
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
    console.error("error updating policy", err);
  }
}

export async function fetchEligibility(id) {
  try {
    const approver = await client.graphql({
      query: getEligibility,
      variables: { id: id }
    });
    const data = await approver.data.getEligibility;
    return data;
  } catch (err) {
    console.error("error fetching eligibility", err);
  }
}

export async function getAllEligibility() {
  let nextToken = null;
  let data = [];
  try {
    do {
    const request = await client.graphql({
      query: listEligibilities,
      variables: { nextToken }
    });
    data = data.concat(request.data.listEligibilities.items);
    nextToken = request.data.listEligibilities.nextToken;
  } while (nextToken);
    return data;
  } catch (err) {
    console.error("error fetching eligibility", err);
    return {"error":err}
  }
}

export async function getSetting(id) {
  try {
    const request = await client.graphql({
        query: getSettings,
        variables: { id: id }
    });
    let data = await request.data.getSettings;
    return data;
  } catch (err) {
    console.error("error fetching settings", err);
  }
}

export async function createSetting(data) {
  try {
    const req = await client.graphql({
        query: createSettings,
        variables: { input: data }
    });
    return req.data.createSettings.id;
  } catch (err) {
    console.error("error creating settings", err);
  }
}
export async function updateSetting(data) {
  try {
    const req = await client.graphql({
        query: updateSettings,
        variables: { input: data }
    });
    return req.data.updateSettings;
  } catch (err) {
    console.error("error updating settings", err);
  }
}

export async function revokePim(data) {
  try {
    updateRequests(data).then(() => {});
  } catch (err) {
    console.error("error revoking request", err);
  }
}