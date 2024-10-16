'use strict';

let options = require('pipeline-cli').Util.parseArguments();

// The root config for common values
const config = require('../../.config/config.json');

const name = config.module.app;
const apiName = config.module.api;

const version = config.version;

const changeId = options.pr; // pull-request number or branch name

// A static deployment is when the deployment is updating dev, test, or prod (rather than a temporary PR)
// See `--type=static` in the `deployStatic.yml` git workflow
const isStaticDeployment = options.type === 'static';

const deployChangeId = (isStaticDeployment && 'deploy') || changeId;
const branch = (isStaticDeployment && options.branch) || null;
const tag = (branch && `build-${version}-${changeId}-${branch}`) || `build-${version}-${changeId}`;

const staticUrls = config.staticUrls || {};
const staticUrlsAPI = config.staticUrlsAPI || {};

const maxUploadNumFiles = 10;
const maxUploadFileSize = 52428800; // (bytes)

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
    branch: branch,
    cpuRequest: '50m',
    cpuLimit: '2000m',
    memoryRequest: '100Mi',
    memoryLimit: '6Gi',
    mapTiler: config.mapTiler.dev
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
    host: (isStaticDeployment && staticUrls.dev) || `${name}-${changeId}-d83219-dev.apps.silver.devops.gov.bc.ca`,
    apiHost:
      (isStaticDeployment && staticUrlsAPI.dev) || `${apiName}-${changeId}-d83219-dev.apps.silver.devops.gov.bc.ca`,
    siteminderLogoutURL: config.siteminderLogoutURL.dev,
    objectStorageURL: config.objectStorageURL.dev,
    objectStorageBucket: config.objectStorageBucket.dev,
    maxUploadNumFiles,
    maxUploadFileSize,
    nodeEnv: 'development',
    mapTiler: config.mapTiler.dev,
    sso: config.sso.dev,
    cpuRequest: '50m',
    cpuLimit: '300m',
    memoryRequest: '100Mi',
    memoryLimit: '500Mi',
    replicas: '1',
    replicasMax: '1',
    backbonePublicApiHost: 'https://api-dev-biohub-platform.apps.silver.devops.gov.bc.ca',
    biohubTaxonPath: '/api/taxonomy/taxon',
    biohubTaxonTsnPath: '/api/taxonomy/taxon/tsn'
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
    host: staticUrls.test,
    apiHost: staticUrlsAPI.test,
    siteminderLogoutURL: config.siteminderLogoutURL.test,
    objectStorageURL: config.objectStorageURL.test,
    objectStorageBucket: config.objectStorageBucket.test,
    maxUploadNumFiles,
    maxUploadFileSize,
    nodeEnv: 'production',
    mapTiler: config.mapTiler.test,
    sso: config.sso.test,
    cpuRequest: '50m',
    cpuLimit: '500m',
    memoryRequest: '100Mi',
    memoryLimit: '500Mi',
    replicas: '2',
    replicasMax: '2',
    backbonePublicApiHost: 'https://api-test-biohub-platform.apps.silver.devops.gov.bc.ca',
    biohubTaxonPath: '/api/taxonomy/taxon',
    biohubTaxonTsnPath: '/api/taxonomy/taxon/tsn'
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
    host: staticUrls.prod,
    apiHost: staticUrlsAPI.prod,
    siteminderLogoutURL: config.siteminderLogoutURL.prod,
    objectStorageURL: config.objectStorageURL.prod,
    objectStorageBucket: config.objectStorageBucket.prod,
    maxUploadNumFiles,
    maxUploadFileSize,
    nodeEnv: 'production',
    mapTiler: config.mapTiler.prod,
    sso: config.sso.prod,
    cpuRequest: '50m',
    cpuLimit: '1000m',
    memoryRequest: '100Mi',
    memoryLimit: '1Gi',
    replicas: '2',
    replicasMax: '2',
    backbonePublicApiHost: 'https://api-biohub-platform.apps.silver.devops.gov.bc.ca',
    biohubTaxonPath: '/api/taxonomy/taxon',
    biohubTaxonTsnPath: '/api/taxonomy/taxon/tsn'
  }
};

module.exports = exports = { phases, options };
