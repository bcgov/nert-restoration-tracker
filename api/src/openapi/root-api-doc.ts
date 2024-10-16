const getHTTPResponse = (description: string) => {
  return {
    description,
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Error'
        }
      }
    }
  };
};

export const rootAPIDoc = {
  openapi: '3.0.0',
  info: {
    version: '0.0.0',
    title: 'restoration-tracker-api',
    description: 'API for Restoration-Tracker',
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
    }
  },
  servers: [
    {
      url: 'http://localhost:6100/api',
      description: 'local api via docker'
    },
    {
      url: 'http://localhost:80/api',
      description: 'local api via docker via nginx'
    },
    {
      url: 'https://api-dev-nert-restoration-tracker.apps.silver.devops.gov.bc.ca',
      description: 'deployed api in dev environment'
    },
    {
      url: 'https://api-test-nert-restoration-tracker.apps.silver.devops.gov.bc.ca',
      description: 'deployed api in test environment'
    },
    {
      url: 'https://api-nert-restoration-tracker.apps.silver.devops.gov.bc.ca',
      description: 'deployed api in prod environment'
    }
  ],
  externalDocs: {
    description: 'Visit GitHub to find out more about this API',
    url: 'https://github.com/bcgov/nert-restoration-tracker.git'
  },
  paths: {},
  components: {
    securitySchemes: {
      Bearer: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          "To access the authenticated api routes, a valid JWT token must be present in the 'Authorization' header. The 'Authorization' header value must be of the form: `Bearer xxxxxx.yyyyyyy.zzzzzz`"
      }
    },
    responses: {
      '400': getHTTPResponse('Bad request'),
      '401': getHTTPResponse('Unauthenticated user'),
      '403': getHTTPResponse('Unauthorized user'),
      '409': getHTTPResponse('Conflict'),
      '500': getHTTPResponse('Server error'),
      default: getHTTPResponse('Unexpected error')
    },
    schemas: {
      Error: {
        description: 'Error response object',
        required: ['name', 'status', 'message'],
        properties: {
          name: {
            type: 'string'
          },
          status: {
            type: 'number'
          },
          message: {
            type: 'string'
          },
          errors: {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'string'
                },
                {
                  type: 'object'
                }
              ]
            }
          }
        }
      }
    }
  }
};
