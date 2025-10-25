import { generateClient } from 'aws-amplify/api';

/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */
const client = generateClient();
import {
  listRequests,
  getRequests,
  listApprovers,
  getLogs,
  getOU,
} from "../../graphql/queries";

export async function fetchAccounts() {
  try {
    const accounts = await client.queries.getAccounts();
    const data = accounts.data;
    return data;
  } catch (err) {
    console.error("error fetching accounts", err);
  }
}

export async function fetchPermissions() {
  try {
    const permissions = await client.queries.getPermissions();
    const data = permissions.data;
    return data;
  } catch (err) {
    console.error("error fetching permissions", err);
  }
}

export async function getMgmtAccountPs() {
  try {
    const permissions = await client.queries.getMgmtPermissions()
    const data = permissions.data;
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
      const requests = await client.models.requests.requestByEmailAndStatus({ email: email, nextToken })
      data = data.concat(requests.data);
      nextToken = requests.nextToken;
    } while (nextToken);
    return data;
  } catch (err) {
    console.error("error fetching requests", err);
    return { "error": err }
  }
}

export async function fetchOUs() {
  try {
    const OU = await client.queries.getOUs();
    const data = OU.data;
    return data;
  } catch (err) {
    console.error("error fetching OUs", err);
    return { "error": err }
  }
}

export async function fetchOU(id) {
  try {
    const OU = await client.graphql({
      query: getOU,
      variables: { id: id }
    });
    const test = await client.queries.getOU({ id: id })
    const data = await OU.data.getOU;
    return data;
  } catch (err) {
    console.error("error fetching OU", err);
  }
}
export async function getGroupMemberships(id) {
  try {
    const members = await client.queries.listGroups({ groupIds: id })
    const data = members.data;
    return data;
  } catch (err) {
    console.error("error fetching members", err);
  }
}

export async function fetchIdCGroups() {
  try {
    const groups = await client.queries.getIdCGroups();
    const data = await groups.data;
    return data;
  } catch (err) {
    console.error("error fetching IdC Groups", err);
  }
}

export async function fetchUsers() {
  try {
    const groups = await client.queries.getUsers()
    const data = await groups.data;
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
    return { "error": err }
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
    do {
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
    return { "error": err }
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
    return { "error": err }
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
    const entitlement = await client.queries.getUserPolicy(args)

    const data = await entitlement.data;
    return data;
  } catch (err) {
    console.error("error fetching Entitlement", err);
  }
}


// Mutations
export async function updateStatus(data) {
  try {
    const req = await client.models.requests.update(data);
    return req.data;
  } catch (err) {
    console.error("error updating status", err);
  }
}

export async function requestTeam(data) {
  try {
    const req = await client.models.requests.create(data);
    return req.data.id;
  } catch (err) {
    console.error("error creating request", err);
  }
}
export async function getSessionLogs(data) {
  try {
    const req = await client.models.sessions.create(data);
    return req.data.id;
  } catch (err) {
    console.error("error creating session Logs", err);
  }
}

export async function deleteSessionLogs(data) {
  try {
    const req = await client.models.sessions.delete(data);
    return req.data;
  } catch (err) {
    console.error("error deleting session log", err);
  }
}

export async function getSession(id) {
  try {
    const request = await client.models.sessions.get({ id: id });
    const data = request.data;
    return data;
  } catch (err) {
    console.error("error fetching session log", err);
  }
}

export async function addApprovers(data) {
  try {
    const req = await client.models.Approvers.create(data);
    return req.data.Id;
  } catch (err) {
    console.error("error adding Approvers", err);
  }
}

export async function delApprover(data) {
  try {
    const req = await client.models.Approvers.delete(data);
    return req.data;
  } catch (err) {
    console.error("error deleting approver", err);
  }
}

export async function editApprover(data) {
  try {
    const req = await client.models.Approvers.update(data);
    return req.data;
  } catch (err) {
    console.error("error updating approver", err);
  }
}

export async function fetchApprovers(id, type) {
  try {
    const approver = await client.models.Approvers.get({ id: id, type: type });
    const data = approver.data;
    return data;
  } catch (err) {
    console.error("error fetching approvers", err);
  }
}

export async function addPolicy(data) {
  try {
    const req = await client.models.Eligibility.create(data)
    return req.data.id;
  } catch (err) {
    console.error("error creating policy", err);
  }
}

export async function delPolicy(data) {
  try {
    const req = await client.models.Eligibility.delete(data);
    return req.data;
  } catch (err) {
    console.error("error deleting policy", err);
  }
}

export async function editPolicy(data) {
  try {
    const req = await client.models.Eligibility.update(data);
    return req.data;
  } catch (err) {
    console.error("error updating policy", err);
  }
}

export async function fetchEligibility(id) {
  try {
    const approver = await client.models.Eligibility.get({ id: id });
    const data = approver.data;
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
      const request = await client.models.Eligibility.list({ nextToken })
      data = data.concat(request.data);
      nextToken = request.nextToken;
    } while (nextToken);
    return data;
  } catch (err) {
    console.error("error fetching eligibility", err);
    return { "error": err }
  }
}

export async function getSetting(id) {
  try {
    const request = await client.models.Settings.get({ id: id });
    let data = request.data;
    return data;
  } catch (err) {
    console.error("error fetching settings", err);
  }
}

export async function createSetting(data) {
  try {
    const req = await client.models.Settings.create(data)
    return req.data.id;
  } catch (err) {
    console.error("error creating settings", err);
  }
}
export async function updateSetting(data) {
  try {
    const req = await client.models.Settings.update(data)
    return req.data;
  } catch (err) {
    console.error("error updating settings", err);
  }
}

export async function revokePim(data) {
  try {
    client.models.requests.update(data).then(() => { });
  } catch (err) {
    console.error("error revoking request", err);
  }
}