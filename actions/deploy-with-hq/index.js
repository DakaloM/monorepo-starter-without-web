const core = require("@actions/core");
const crypto = require("crypto");
const { HttpClient } = require("@actions/http-client");
const {
  BasicCredentialHandler,
  BearerCredentialHandler,
} = require("@actions/http-client/lib/auth");

(async () => {
  const apps = JSON.parse(core.getInput("apps", { required: true }));

  const endpoint = core.getInput("endpoint", { required: true });
  const version = core.getInput("version", { required: true });
  const installation = core.getInput("installation", { required: true });

  const clientId = core.getInput("clientId", { required: true });
  const clientSecret = core.getInput("clientSecret", { required: true });
  const username = core.getInput("username", { required: true });
  const password = core.getInput("password", { required: true });

  const serviceMapping = {
    "client-web": "WF_CLIENT_WEB",
    api: "WF_API_NEXT",
    gateway: "WF_GATEWAY",
  };

  // Request a `Bearer` token from HQ
  const http = new HttpClient("github/action", [
    new BasicCredentialHandler(clientId, clientSecret),
  ]);

  let bearerToken;

  try {
    const auth = await http.postJson(`${endpoint}/oauth/token`, {
      grant_type: "password",
      username,
      password,
    });

    bearerToken = auth.result.access_token;
  } catch (e) {
    core.error(e);
    core.setFailed("Failed to acquire authentication token from HQ");
  }

  http.handlers = [new BearerCredentialHandler(bearerToken)];

  try {
    // Create a rollout with the new services via the `createRollout` mutation.
    const query = `mutation CreateRollout($input: CreateRolloutInput!) {
      createRollout(input: $input) {
        errors { code path type message }
        clientMutationId
        rollout { id }
      }
    }`;

    const services = apps
      .filter((app) => serviceMapping[app])
      .map((app) => ({
        name: serviceMapping[app],
        version: version,
      }));

    const rollout = await http.postJson(`${endpoint}/graphql`, {
      query,
      variables: {
        input: {
          clientMutationId: crypto.randomUUID(),
          installationTags: [installation],
          services,
        },
      },
    });

    core.debug(rollout.result);

    if (rollout.statusCode === 200 && !rollout.result.errors) {
      core.info("Rollout successfully created");
    } else {
      core.setFailed("Failed to create rollout");
    }
  } catch (e) {
    core.error(e);
    core.setFailed("Failed to create rollout");
  }
})();
