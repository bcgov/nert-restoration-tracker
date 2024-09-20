'use strict';

let options = require('pipeline-cli').Util.parseArguments();

// The root config for common values
const config = require('../../.config/config.json');

const name = config.module.db;

const version = config.version;

const changeId = options.pr; // pull-request number or branch name

// A static deployment is when the deployment is updating dev, test, or prod (rather than a temporary PR)
// See `--type=static` in the `deployStatic.yml` git workflow
const isStaticDeployment = options.type === 'static';

const deployChangeId = (isStaticDeployment && 'deploy') || changeId;
const branch = (isStaticDeployment && options.branch) || null;
const tag = (branch && `build-${version}-${changeId}-${branch}`) || `build-${version}-${changeId}`;

// Default: run both seeding and migrations
let dbSetupDockerfilePath = './.docker/db/Dockerfile.setup';

const processOptions = (options) => {
  const result = { ...options };

  // Check git
  if (!result.git.url.includes('.git')) {
    result.git.url = `${result.git.url}.git`;
  }

  if (!result.git.http_url.includes('.git')) {
    result.git.http_url = `${result.git.http_url}.git`;
  }

  // Fixing repo
  if (result.git.repository.includes('/')) {
    const last = result.git.repository.split('/').pop();
    const final = last.split('.')[0];
    result.git.repository = final;
  }

  return result;
};

options = processOptions(options);

const phases = {
  build: {
    namespace: 'd83219-tools',
    name: `${name}`,
    phase: 'build',
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${name}-build-${changeId}`,
    version: `${version}-${changeId}`,
    tag: tag,
    env: 'build',
    tz: config.timezone.db,
    branch: branch,
    dbSetupDockerfilePath: dbSetupDockerfilePath
  },
  dev: {
    namespace: 'd83219-dev',
    name: `${name}`,
    phase: 'dev',
    changeId: deployChangeId,
    suffix: `-dev-${deployChangeId}`,
    instance: `${name}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${version}-${deployChangeId}`,
    nodeEnv: 'development',
    tz: config.timezone.db,
    dbSetupDockerfilePath: dbSetupDockerfilePath,
    volumeCapacity: (isStaticDeployment && '3Gi') || '500Mi',
    cpuRequest: '50m',
    cpuLimit: '600m',
    memoryRequest: '100Mi',
    memoryLimit: '4Gi',
    replicas: '1'
  },
  test: {
    namespace: 'd83219-test',
    name: `${name}`,
    phase: 'test',
    changeId: deployChangeId,
    suffix: `-test`,
    instance: `${name}-test`,
    version: `${version}`,
    tag: `test-${version}`,
    nodeEnv: 'production',
    tz: config.timezone.db,
    dbSetupDockerfilePath: dbSetupDockerfilePath,
    volumeCapacity: '3Gi',
    cpuRequest: '50m',
    cpuLimit: '2000m',
    memoryRequest: '100Mi',
    memoryLimit: '5Gi',
    replicas: '1'
  },
  prod: {
    namespace: 'd83219-prod',
    name: `${name}`,
    phase: 'prod',
    changeId: deployChangeId,
    suffix: `-prod`,
    instance: `${name}-prod`,
    version: `${version}`,
    tag: `prod-${version}`,
    nodeEnv: 'production',
    tz: config.timezone.db,
    dbSetupDockerfilePath: dbSetupDockerfilePath,
    volumeCapacity: '5Gi',
    cpuRequest: '50m',
    cpuLimit: '4000m',
    memoryRequest: '100Mi',
    memoryLimit: '10Gi',
    replicas: '1'
  }
};

module.exports = exports = { phases, options };
