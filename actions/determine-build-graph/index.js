const core = require("@actions/core");
const exec = require("@actions/exec");
const path = require("path");
const glob = require("@actions/glob");

(async () => {
  const currentBranch = core.getInput("ref", { required: true });

  // The next step is to use `turbo` to determine the affected apps and packages. The CLI
  // supports outputting the json of a theoretical run containing the respective packages and apps.
  let stdout = "";
  let stderr = "";

  const options = {
    listeners: {
      stdout: (data) => (stdout += data.toString()),
      stderr: (data) => (stderr += data.toString()),
    },
  };

  await exec.exec(
    "./node_modules/.bin/turbo",
    [
      "run",
      "build",
      currentBranch ? `--filter=...[${currentBranch}]` : null,
      "--dry=json",
      "--no-cache",
    ].filter(Boolean),
    options
  );

  if (stderr) {
    core.error(stderr);
    return;
  }

  const json = stdout.substring(
    stdout.indexOf("{"),
    stdout.lastIndexOf("}") + 1
  );

  const output = JSON.parse(json);
  const ignoreList = ["//"];

  const affectedApps = [];
  const affectedPkgs = [];

  output.packages.forEach((pkg) => {
    if (ignoreList.includes(pkg)) {
      return;
    }

    if (output.hasOwnProperty("tasks")) {
      const task = output.tasks.find((t) => t.package === pkg);
      if (task !== undefined && task.hasOwnProperty("directory")) {
        if (task.directory.startsWith("packages")) {
          affectedPkgs.push(pkg);
        } else if (task.directory.startsWith("apps")) {
          affectedApps.push(pkg);
        }
      }
    }
  });

  const affected = affectedApps.concat(affectedPkgs);

  affected.sort();
  affectedApps.sort();
  affectedPkgs.sort();

  const allApps = await glob
    .create("apps/*/package.json")
    .then((globber) => globber.glob())
    .then((paths) => paths.map((p) => path.basename(path.dirname(p))));

  const allDockerApps = await glob
    .create("apps/*/Dockerfile")
    .then((globber) => globber.glob())
    .then((paths) => paths.map((p) => path.basename(path.dirname(p))));

  const affectedDockerApps = affectedApps.filter((a) =>
    allDockerApps.includes(a)
  );

  const allPkgs = await glob
    .create("packages/*/package.json")
    .then((globber) => globber.glob())
    .then((paths) => paths.map((p) => path.basename(path.dirname(p))));

  const allProjects = allApps.concat(allPkgs);
  allProjects.sort();

  // This is a little helper that also prints the output for easier debugging.
  const setOutput = (name, value) => {
    core.info(`${name}: ${JSON.stringify(value)}`);
    core.setOutput(name, value);
  };

  setOutput("all-affected-apps", affectedApps);
  setOutput("all-affected-docker-apps", affectedDockerApps);
  setOutput("all-affected-packages", affectedPkgs);
  setOutput("all-affected-projects", affected);
  setOutput("all-apps", allApps);
  setOutput("all-docker-apps", allDockerApps);
  setOutput("all-packages", allPkgs);
  setOutput("all-projects", allProjects);
  setOutput("has-affected-apps", affectedApps.length > 0);
  setOutput("has-affected-docker-apps", affectedDockerApps.length > 0);
  setOutput("has-affected-packages", affectedPkgs.length > 0);
  setOutput("has-affected-projects", affected.length > 0);
})();
