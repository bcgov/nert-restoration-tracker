'use strict';

let options = require('pipeline-cli').Util.parseArguments();

// The root config for common values
const config = require('../../.config/config.json');

const name = config.module.api;
const dbName = config.module.db;

const version = config.version;

const changeId = options.pr; // pull-request number or branch name

// A static deployment is when the deployment is updating dev, test, or prod (rather than a temporary PR)
// See `--type=static` in the `deployStatic.yml` git workflow
const isStaticDeployment = options.type === 'static';

const deployChangeId = (isStaticDeployment && 'deploy') || changeId;
const branch = (isStaticDeployment && options.branch) || null;
const tag = (branch && `build-${version}-${changeId}-${branch}`) || `build-${version}-${changeId}`;

const staticUrlsAPI = config.staticUrlsAPI || {};

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
    dbName: `${dbName}`,
    phase: 'build',
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${name}-build-${changeId}`,
    version: `${version}-${changeId}`,
    tag: tag,
    env: 'build',
    tz: config.timezone.api,
    branch: branch,
    cpuRequest: '50m',
    cpuLimit: '1000m',
    memoryRequest: '100Mi',
    memoryLimit: '3Gi'
  },
  dev: {
    namespace: 'd83219-dev',
    name: `${name}`,
    dbName: `${dbName}`,
    phase: 'dev',
    changeId: deployChangeId,
    suffix: `-dev-${deployChangeId}`,
    instance: `${name}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${version}-${deployChangeId}`,
    host: (isStaticDeployment && staticUrlsAPI.dev) || `${name}-${changeId}-d83219-dev.apps.silver.devops.gov.bc.ca`,
    nodeEnv: 'development',
    s3KeyPrefix: (isStaticDeployment && 'restoration') || `local/${deployChangeId}/restoration`,
    tz: config.timezone.api,
    sso: config.sso.dev,
    logLevel: 'info',
    nodeOptions: '--max_old_space_size=3000', // 75% of memoryLimit (bytes)
    cpuRequest: '50m',
    cpuLimit: '600m',
    memoryRequest: '100Mi',
    memoryLimit: '4Gi',
    replicas: '1',
    replicasMax: '1'
  },
  test: {
    namespace: 'd83219-test',
    name: `${name}`,
    dbName: `${dbName}`,
    phase: 'test',
    changeId: deployChangeId,
    suffix: `-test`,
    instance: `${name}-test`,
    version: `${version}`,
    tag: `test-${version}`,
    host: staticUrlsAPI.test,
    nodeEnv: 'production',
    s3KeyPrefix: 'restoration',
    tz: config.timezone.api,
    sso: config.sso.test,
    logLevel: 'warn',
    nodeOptions: '--max_old_space_size=3000', // 75% of memoryLimit (bytes)
    cpuRequest: '50m',
    cpuLimit: '1000m',
    memoryRequest: '100Mi',
    memoryLimit: '4Gi',
    replicas: '2',
    replicasMax: '2'
  },
  prod: {
    namespace: 'd83219-prod',
    name: `${name}`,
    dbName: `${dbName}`,
    phase: 'prod',
    changeId: deployChangeId,
    suffix: `-prod`,
    instance: `${name}-prod`,
    version: `${version}`,
    tag: `prod-${version}`,
    host: staticUrlsAPI.prod,
    nodeEnv: 'production',
    s3KeyPrefix: 'restoration',
    tz: config.timezone.api,
    sso: config.sso.prod,
    logLevel: 'silent',
    nodeOptions: '--max_old_space_size=6000', // 75% of memoryLimit (bytes)
    cpuRequest: '50m',
    cpuLimit: '2000m',
    memoryRequest: '100Mi',
    memoryLimit: '8Gi',
    replicas: '2',
    replicasMax: '2'
  }
};

module.exports = exports = { phases, options };
