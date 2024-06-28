import { geoJsonFeature } from './geoJson';

/**
 * Request Object for project create POST request
 */
export const projectCreatePostRequestObject = {
  title: 'Project post request object',
  type: 'object',
  required: [
    'project',
    'objective',
    'focus',
    'contact',
    'species',
    'iucn',
    'authorization',
    'funding',
    'partnership',
    'location',
    'restoration_plan'
  ],
  additionalProperties: false,
  properties: {
    project: {
      title: 'Project general information',
      type: 'object',
      properties: {
        project_name: {
          type: 'string'
        },
        project_image: {
          type: 'string',
          nullable: true,
          description: 'URL to the project image'
        },
        is_project: {
          type: 'boolean',
          description: 'True is project, False is plan'
        },
        brief_desc: {
          type: 'string'
        },
        state_code: {
          type: 'number',
          description: 'Workflow project or plan state'
        },
        start_date: {
          type: 'string',
          description: 'ISO 8601 date string',
          nullable: true
        },
        end_date: {
          type: 'string',
          description: 'ISO 8601 date string',
          nullable: true
        },
        actual_start_date: {
          type: 'string',
          description: 'ISO 8601 date string',
          nullable: true
        },
        actual_end_date: {
          type: 'string',
          description: 'ISO 8601 date string',
          nullable: true
        },
        is_healing_land: {
          type: 'boolean',
          description: 'Project or plan focused on healing the land'
        },
        is_healing_people: {
          type: 'boolean',
          description: 'Project or plan focused on healing the people'
        },
        is_land_initiative: {
          type: 'boolean',
          description: 'Project or plan focused on land based restoration initiative'
        },
        is_cultural_initiative: {
          type: 'boolean',
          description: 'Project or plan focused on cultural or community investment initiative'
        }
      }
    },
    objective: {
      title: 'Project objectives',
      type: 'object',
      additionalProperties: false,
      properties: {
        objectives: {
          type: 'array',
          items: {
            title: 'Project objectives',
            type: 'object',
            properties: {
              objective: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    focus: {
      title: 'Project focuses',
      type: 'object',
      additionalProperties: false,
      properties: {
        focuses: {
          type: 'array',
          items: {
            type: 'number'
          }
        },
        people_involved: {
          type: 'number',
          description: 'Number of people involved in the project',
          nullable: true
        }
      }
    },
    species: {
      title: 'Project species',
      type: 'object',
      required: ['focal_species'],
      properties: {
        focal_species: {
          type: 'array',
          items: {
            type: 'number'
          }
        }
      }
    },
    iucn: {
      title: 'Project IUCN classifications',
      type: 'object',
      required: ['classificationDetails'],
      additionalProperties: false,
      properties: {
        classificationDetails: {
          type: 'array',
          items: {
            title: 'IUCN classification',
            type: 'object',
            required: ['classification', 'subClassification1', 'subClassification2'],
            properties: {
              classification: {
                type: 'number',
                nullable: true
              },
              subClassification1: {
                type: 'number',
                nullable: true
              },
              subClassification2: {
                type: 'number',
                nullable: true
              }
            }
          }
        }
      }
    },
    contact: {
      title: 'Project contact',
      type: 'object',
      required: ['contacts'],
      additionalProperties: false,
      properties: {
        contacts: {
          type: 'array',
          items: {
            title: 'contacts',
            type: 'object',
            required: ['first_name', 'last_name', 'email_address', 'organization', 'is_public', 'is_primary'],
            properties: {
              first_name: {
                type: 'string'
              },
              last_name: {
                type: 'string'
              },
              email_address: {
                type: 'string'
              },
              organization: {
                type: 'string'
              },
              is_public: {
                type: 'string',
                enum: ['true', 'false']
              },
              is_primary: {
                type: 'string',
                enum: ['true', 'false']
              },
              phone_number: {
                type: 'string',
                nullable: true
              }
            }
          }
        }
      }
    },
    authorization: {
      title: 'Project authorizations',
      type: 'object',
      required: ['authorizations'],
      additionalProperties: false,
      properties: {
        authorizations: {
          type: 'array',
          required: ['authorization_ref', 'authorization_type'],
          items: {
            title: 'Project authorization',
            type: 'object',
            properties: {
              authorization_ref: {
                type: 'string'
              },
              authorization_type: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    funding: {
      title: 'Project funding sources',
      type: 'object',
      required: ['fundingSources'],
      properties: {
        fundingSources: {
          type: 'array',
          items: {
            title: 'Project funding organization',
            type: 'object',
            required: ['organization_name', 'funding_amount', 'is_public'],
            properties: {
              organization_name: {
                type: 'string'
              },
              description: {
                type: 'string',
                nullable: true
              },
              funding_project_id: {
                type: 'string'
              },
              funding_amount: {
                type: 'number'
              },
              start_date: {
                type: 'string',
                description: 'ISO 8601 date string',
                nullable: true
              },
              end_date: {
                type: 'string',
                description: 'ISO 8601 date string',
                nullable: true
              },
              is_public: {
                type: 'string',
                enum: ['true', 'false']
              }
            }
          }
        }
      }
    },
    partnership: {
      title: 'Project partnerships',
      type: 'object',
      additionalProperties: false,
      properties: {
        partnerships: {
          type: 'array',
          items: {
            title: 'Project partnerships',
            type: 'object',
            properties: {
              partnership: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    location: {
      title: 'Location',
      type: 'object',
      required: ['geometry', 'region', 'number_sites'],
      additionalProperties: false,
      properties: {
        is_within_overlapping: {
          type: 'string',
          enum: ['true', 'false', 'dont_know']
        },
        size_ha: {
          type: 'number',
          nullable: true
        },
        number_sites: {
          type: 'number'
        },
        conservationAreas: {
          type: 'array',
          additionalProperties: true,
          items: {
            title: 'Project conservation areas',
            type: 'object',
            properties: {
              conservationArea: {
                type: 'string'
              }
            }
          }
        },
        geometry: {
          type: 'array',
          items: {
            ...(geoJsonFeature as object)
          }
        },
        region: {
          oneOf: [
            {
              type: 'string'
            },
            {
              type: 'number'
            }
          ]
        }
      }
    },
    restoration_plan: {
      title: 'Project related to public plan',
      type: 'object',
      additionalProperties: false,
      properties: {
        is_project_part_public_plan: {
          type: 'boolean'
        }
      }
    }
  }
};

const projectUpdateProperties = {
  contact: { type: 'object', properties: {} },
  authorization: { type: 'object', properties: {} },
  project: { type: 'object', properties: {} },
  objectives: { type: 'object', properties: {} },
  location: { type: 'object', properties: {} },
  iucn: {
    type: 'object',
    properties: {
      classificationDetails: {
        type: 'array',
        items: {
          title: 'IUCN classification',
          type: 'object',
          properties: {
            classification: {
              type: 'number'
            },
            subClassification1: {
              type: 'number'
            },
            subClassification2: {
              type: 'number'
            }
          }
        }
      }
    }
  },
  funding: { type: 'object', properties: {} },
  partnership: { type: 'object', properties: {} },
  objective: { type: 'object', properties: {} }
};

/**
 * Response object for project update GET request
 */
export const projectUpdateGetResponseObject = {
  title: 'Project get response object, for update purposes',
  type: 'object',
  properties: {
    ...projectUpdateProperties
  }
};

/**
 * Request object for project update PUT request
 */
export const projectUpdatePutRequestObject = {
  title: 'Project Put Object',
  type: 'object',
  properties: {
    ...projectUpdateProperties
  }
};

/**
 * Basic response object for a project.
 */
export const projectIdResponseObject = {
  title: 'Project Response Object',
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'number'
    }
  }
};
