import * as fastify from "fastify";

export interface SwaggerSchema extends fastify.RouteSchema {
  description: string;
  tags: string[];
  summary: string;
  security?: object;
  consumes?: string[];
}

export interface Schema {
  schema: SwaggerSchema;
}

// ------------------------------------------------------------
//       Responses
// ------------------------------------------------------------

function getAuthErrorSchema() {
  return {
    description: "Unauthorized request",
    type: "object",
    properties: {
      apiVersion: { type: "string", example: "1.0" },
      error: {
        type: "object",
        properties: {
          code: { type: "string", example: "401" },
          message: {
            type: "string",
            example: "A valid JWT auth bearer token is required for this route.",
          },
        },
      },
    },
  };
}

function getSuccessfulSchema() {
  return {
    description: "successful response",
    type: "string",
    example: "OK",
  };
}

// ------------------------------------------------------------
//       system
// ------------------------------------------------------------

export function getReadinessSchema() {
  return {
    schema: {
      description:
        "Returns '200 OK' if the API is up and the Multichain service is reachable. " +
        "'503 Service unavailable.' otherwise.",
      tags: ["system"],
      summary: "Check if the Multichain is reachable",
      response: {
        200: getSuccessfulSchema(),
        401: getAuthErrorSchema(),
        503: {
          description: "Blockchain not ready",
          type: "string",
          example: "Service unavailable.",
        },
      },
    },
  };
}

export function getLivenessSchema(): Schema {
  return {
    schema: {
      description: "Returns '200 OK' if the API is up.",
      tags: ["system"],
      summary: "Check if the API is up",
      response: {
        200: getSuccessfulSchema(),
      },
    },
  };
}

// ------------------------------------------------------------
//       user
// ------------------------------------------------------------

export function getAuthenticateSchema(): Schema {
  return {
    schema: {
      description:
        "Authenticate and retrieve a token in return. This token can then be supplied in the " +
        "HTTP Authorization header, which is expected by most of the other. " +
        "\nIf a token is required write 'Bearer' into the 'API Token' field of an endpoint " +
        "you want to test and copy the token afterwards like in the following example:\n " +
        ".\n" +
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      tags: ["user"],
      summary: "Authenticate with user and password",
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              user: {
                type: "object",
                additionalProperties: false,
                properties: {
                  id: { type: "string", example: "aSmith" },
                  password: { type: "string", example: "mySecretPassword" },
                },
                required: ["id", "password"],
              },
            },
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "aSmith" },
                    displayName: { type: "string", example: "Alice Smith" },
                    organization: { type: "string", example: "Alice's Solutions & Co" },
                    allowedIntents: { type: "array", items: { type: "string" } },
                    groups: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          groupId: { type: "string", example: "Manager" },
                          displayName: { type: "string", example: "All Manager Group" },
                        },
                      },
                    },
                    token: {
                      type: "string",
                      example:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJyb290IiwiYWRkcm" +
                        "VzcyI6IjFIVXF2dHE5WU1QaXlMZUxWM3pGRks5dGpBblVDVTNFbTQzaVBrIiwib3JnYW" +
                        "5pemF0aW9uIjoiS2ZXIiwib3JnYW5pemF0aW9uQWRkcmVzcyI6IjFIVXF2dHE5WU1QaXl" +
                        "MZUxWM3pGRks5dGpBblVDVTNFbTQzaVBrIiwiZ3JvdXBzIjpbXSwiaWF0IjoxNTM2ODI2M" +
                        "TkyLCJleHAiOjE1MzY4Mjk3OTJ9.PZbjTpsgnIHjNaDHos9LVwwrckYhpWjv1DDiojskylI",
                    },
                  },
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getUserListSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "List all registered users and groups.\n" +
        "In case of a user the 'organization' property exists" +
        "In case of a group the 'isGroup' property exists with value 'true",
      tags: ["user"],
      summary: "List all registered users",
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "aSmith" },
                      displayName: { type: "string", example: "Alice Smith" },
                      organization: { type: "string", example: "Alice's Solutions & Co" },
                      isGroup: { type: "boolean", example: true },
                    },
                  },
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getCreateUserSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "Create a new user.",
      tags: ["global"],
      summary: "Create a user",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              user: {
                type: "object",
                properties: {
                  additionalProperties: false,
                  id: { type: "string", example: "aSmith" },
                  displayName: { type: "string", example: "Alice Smith" },
                  organization: { type: "string", example: "Alice's Solutions & Co" },
                  password: { type: "string", example: "mySecretPassword" },
                },
                required: ["id", "displayName", "organization", "password"],
              },
            },
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "myId" },
                    displayName: { type: "string", example: "Alice Smith" },
                    organization: { type: "string", example: "Alice's Solutions & Co" },
                    address: {
                      type: "string",
                      example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM",
                    },
                  },
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
        409: {
          description: "User already exists",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "409" },
                message: { type: "string", example: "User already exists." },
              },
            },
          },
        },
      },
    },
  };
}

export function getCreateGroupSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "Create a new group.",
      tags: ["global"],
      summary: "Create a new group",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              group: {
                type: "object",
                properties: {
                  additionalProperties: false,
                  id: { type: "string", example: "Manager" },
                  displayName: { type: "string", example: "All Manager Group" },
                  users: { type: "array", items: { type: "string" } },
                },
                required: ["id", "displayName", "users"],
              },
            },
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                created: { type: "boolean", example: "true" },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
        409: {
          description: "Group already exists",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "409" },
                message: { type: "string", example: "User already exists." },
              },
            },
          },
        },
      },
    },
  };
}

// ------------------------------------------------------------
//       global
// ------------------------------------------------------------

export function getCreateProjectSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Create a new project.\n.\n" +
        "Note that the only possible values for 'status' are: 'open' and 'closed'",
      tags: ["global"],
      summary: "Create a new project",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            properties: {
              project: {
                type: "object",
                additionalProperties: false,
                properties: {
                  id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                  status: { type: "string", example: "open" },
                  displayName: { type: "string", example: "Build a town-project" },
                  description: { type: "string", example: "A town should be built" },
                  amount: { type: "string", example: "10000" },
                  assignee: { type: "string", example: "aSmith" },
                  currency: { type: "string", example: "EUR" },
                  thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                },
              },
            },
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                created: { type: "boolean", example: "true" },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getGlobalListPermissionsSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "See the current global permissions.",
      tags: ["global"],
      summary: "List all existing permissions",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
        },
      },
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              additionalProperties: true,
              example: { "notification.list": ["aSmith"], "notification.markRead": ["aSmith"] },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getGlobalGrantPermissionSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Grant the right to execute a specific intent on the Global scope to a given user.",
      tags: ["global"],
      summary: "Grant a permission to a group or user",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: { type: "string", example: "global.createProject" },
            },
            required: ["identity", "intent"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getGrantAllPermissions(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Grant all available permissions to a user. Useful as a shorthand for creating admin users.",
      tags: ["global"],
      summary: "Grant all permission to a group or user",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
            },
            required: ["identity"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
              example: "OK",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getGlobalRevokePermissionSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Revoke the right to execute a specific intent on the Global scope to a given user.",
      tags: ["global"],
      summary: "Revoke a permission from a group or user",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: { type: "string", example: "global.createProject" },
            },
            required: ["identity", "intent"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

// ------------------------------------------------------------
//       group
// ------------------------------------------------------------

export function getGroupListSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "List all user groups.",
      tags: ["group"],
      summary: "List all existing groups",
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                groups: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      groupId: { type: "string", example: "Manager" },
                      displayName: { type: "string", example: "All Manager Group" },
                      users: {
                        type: "array",
                        items: { type: "string", example: "aSmith" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getAddUserSchema(server): Schema {
  return {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Add user to a group",
        tags: ["group"],
        summary: "Add a user to a group",
        security: [
          {
            bearerToken: [],
          },
        ],
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              additionalProperties: false,
              properties: {
                groupId: { type: "string", example: "Manager" },
                userId: { type: "string", example: "aSmith" },
              },
              required: ["groupId", "userId"],
            },
          },
        },
        response: {
          200: {
            description: "successful response",
            type: "object",
            properties: {
              apiVersion: { type: "string", example: "1.0" },
              data: {
                type: "object",
                properties: {
                  added: { type: "boolean", example: "true" },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    };
}

export function getRemoveUserSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "Remove user from a group",
      tags: ["group"],
      summary: "Remove a user from a group",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              groupId: { type: "string", example: "Manager" },
              userId: { type: "string", example: "aSmith" },
            },
            required: ["groupId", "userId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                deleted: { type: "boolean", example: "true" },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

// ------------------------------------------------------------
//       project
// ------------------------------------------------------------

export function getProjectListSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "Retrieve all projects the user is allowed to see.",
      tags: ["project"],
      summary: "List all projects",
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                          creationUnixTs: { type: "string", example: "1536154645775" },
                          status: { type: "string", example: "open" },
                          displayName: { type: "string", example: "Build a town-project" },
                          description: { type: "string", example: "A town should be built" },
                          amount: { type: "string", example: "10000" },
                          assignee: { type: "string", example: "aSmith" },
                          currency: { type: "string", example: "EUR" },
                          thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                        },
                      },
                      log: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            key: { type: "string" },
                            intent: { type: "string", example: "global.createProject" },
                            createdBy: { type: "string", example: "aSmith" },
                            createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                            dataVersion: { type: "string", example: "1" },
                            data: {
                              type: "object",
                              properties: {
                                project: {
                                  type: "object",
                                  properties: {
                                    id: {
                                      type: "string",
                                      example: "d0e8c69eg298c87e3899119e025eff1f",
                                    },
                                    creationUnixTs: { type: "string", example: "1536154645775" },
                                    status: { type: "string", example: "open" },
                                    displayName: {
                                      type: "string",
                                      example: "Build a town-project",
                                    },
                                    description: {
                                      type: "string",
                                      example: "A town should be built",
                                    },
                                    amount: { type: "string", example: "10000" },
                                    assignee: { type: "string", example: "aSmith" },
                                    currency: { type: "string", example: "EUR" },
                                    thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                                  },
                                },
                                permissions: {
                                  type: "object",
                                  additionalProperties: true,
                                  example: {
                                    "subproject.intent.listPermissions": ["aSmith", "jDoe"],
                                  },
                                },
                                snapshot: {
                                  type: "object",
                                  properties: {
                                    displayName: {
                                      type: "string",
                                      example: "Build a town-project",
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      allowedIntents: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getProjectViewDetailsSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "Retrieve details about a specific project.",
      tags: ["project"],
      summary: "View details",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
        },
      },
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                project: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                        creationUnixTs: { type: "string", example: "1536154645775" },
                        status: { type: "string", example: "open" },
                        displayName: { type: "string", example: "Build a town-project" },
                        description: { type: "string", example: "A town should be built" },
                        amount: { type: "string", example: "10000" },
                        assignee: { type: "string", example: "aSmith" },
                        currency: { type: "string", example: "EUR" },
                        thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                      },
                    },
                    log: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          key: { type: "string" },
                          intent: { type: "string", example: "global.createProject" },
                          createdBy: { type: "string", example: "aSmith" },
                          createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                          dataVersion: { type: "string", example: "1" },
                          data: {
                            type: "object",
                            properties: {
                              project: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    example: "d0e8c69eg298c87e3899119e025eff1f",
                                  },
                                  creationUnixTs: { type: "string", example: "1536154645775" },
                                  status: { type: "string", example: "open" },
                                  displayName: {
                                    type: "string",
                                    example: "Build a town-project",
                                  },
                                  description: {
                                    type: "string",
                                    example: "A town should be built",
                                  },
                                  amount: { type: "string", example: "10000" },
                                  assignee: { type: "string", example: "aSmith" },
                                  currency: { type: "string", example: "EUR" },
                                  thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                                },
                              },
                              permissions: {
                                type: "object",
                                additionalProperties: true,
                                example: {
                                  "subproject.intent.listPermissions": ["aSmith", "jDoe"],
                                },
                              },
                              snapshot: {
                                type: "object",
                                properties: {
                                  displayName: {
                                    type: "string",
                                    example: "townproject",
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    allowedIntents: { type: "array", items: { type: "string" } },
                  },
                },
                subprojects: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: true,
                    example: { mySubproject: {} },
                  },
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getProjectAssignSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Assign a project to a given user. The assigned user will be notified about the change.",
      tags: ["project"],
      summary: "Assign a user or group to a project",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
            },
            required: ["identity", "projectId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getProjectUpdateSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Partially update a project. Only properties mentioned in the request body are touched, " +
        "others are not affected. The assigned user will be notified about the change.",
      tags: ["project"],
      summary: "Update a project",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              displayName: { type: "string", example: "townproject" },
              description: { type: "string", example: "A town should be built" },
              amount: { type: "string", example: "10000" },
              assignee: { type: "string", example: "aSmith" },
              currency: { type: "string", example: "EUR" },
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
            },
            required: ["projectId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getProjectCloseSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Set a project's status to 'closed' if, and only if, all associated " +
        "subprojects are already set to 'closed'.",
      tags: ["project"],
      summary: "Close a project",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
            },
            required: ["projectId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getCreateSubprojectSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Create a subproject and associate it to the given project.\n.\n" +
        "Note that the only possible values for 'status' are: 'open' and 'closed'",
      tags: ["project"],
      summary: "Create a subproject",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subproject: {
                type: "object",
                additionalProperties: false,
                properties: {
                  id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                  status: { type: "string", example: "open" },
                  displayName: { type: "string", example: "townproject" },
                  description: { type: "string", example: "A town should be built" },
                  amount: { type: "string", example: "10000" },
                  assignee: { type: "string", example: "aSmith" },
                  currency: { type: "string", example: "EUR" },
                },
                required: ["displayName", "description", "amount", "currency"],
              },
            },
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                created: { type: "boolean", example: "true" },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getProjectViewHistorySchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "View the history of a given project (filtered by what the user is allowed to see).",
      tags: ["project"],
      summary: "View history",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
        },
      },
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                events: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      key: { type: "string" },
                      intent: { type: "string", example: "global.createProject" },
                      createdBy: { type: "string", example: "aSmith" },
                      createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                      dataVersion: { type: "string", example: "1" },
                      data: {
                        type: "object",
                        additionalProperties: true,
                        example: { identity: "aSmith", intent: "subproject.viewDetails" },
                        properties: {
                          permissions: {
                            type: "object",
                            additionalProperties: true,
                            example: { "subproject.intent.listPermissions": ["aSmith", "jDoe"] },
                          },
                        },
                      },
                      snapshot: {
                        type: "object",
                        properties: {
                          displayName: { type: "string", example: "townproject" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getProjectListPermissionSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "See the permissions for a given project.",
      tags: ["project"],
      summary: "List all permissions",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
        },
      },
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              additionalProperties: true,
              example: {
                "project.viewDetails": ["aSmith", "jDoe"],
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getProjectGrantPermissionSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Grant a permission to a user. After this call has returned, the " +
        "user will be allowed to execute the given intent.",
      tags: ["project"],
      summary: "Grant a permission to a user or group",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: { type: "string", example: "global.createProject" },
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
            },
            required: ["identity", "intent", "projectId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getProjectRevokePermissionSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Revoke a permission from a user. After this call has returned, the " +
        "user will no longer be able to execute the given intent.",
      tags: ["project"],
      summary: "Revoke a permission from a user or group",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: { type: "string", example: "global.createProject" },
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
            },
            required: ["identity", "intent", "projectId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

// ------------------------------------------------------------
//       subproject
// ------------------------------------------------------------

export function getSubprojectListSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Retrieve all subprojects for a given project. Note that any " +
        "subprojects the user is not allowed to see are left out of the response.",
      tags: ["subproject"],
      summary: "List all subprojects of a given project",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
        },
      },
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                          creationUnixTs: { type: "string", example: "1536154645775" },
                          status: { type: "string", example: "open" },
                          displayName: { type: "string", example: "school" },
                          description: { type: "string", example: "school should be built" },
                          amount: { type: "string", example: "3000" },
                          assignee: { type: "string", example: "aSmith" },
                          currency: { type: "string", example: "EUR" },
                          thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                        },
                      },
                      log: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            key: { type: "string" },
                            intent: { type: "string", example: "global.createProject" },
                            createdBy: { type: "string", example: "aSmith" },
                            createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                            dataVersion: { type: "string", example: "1" },
                            data: {
                              type: "object",
                              properties: {
                                subproject: {
                                  type: "object",
                                  properties: {
                                    id: {
                                      type: "string",
                                      example: "d0e8c69eg298c87e3899119e025eff1f",
                                    },
                                    creationUnixTs: { type: "string", example: "1536154645775" },
                                    status: { type: "string", example: "open" },
                                    displayName: { type: "string", example: "school" },
                                    description: {
                                      type: "string",
                                      example: "school should be built",
                                    },
                                    amount: { type: "string", example: "3000" },
                                    assignee: { type: "string", example: "aSmith" },
                                    currency: { type: "string", example: "EUR" },
                                    thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                                  },
                                },
                                permissions: {
                                  type: "object",
                                  additionalProperties: true,
                                  example: {
                                    "subproject.intent.listPermissions": ["aSmith", "jDoe"],
                                  },
                                },
                                snapshot: {
                                  type: "object",
                                  properties: {
                                    displayName: { type: "string", example: "school" },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      allowedIntents: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getSubprojectViewDetailsSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "Retrieve details about a specific subproject.",
      tags: ["subproject"],
      summary: "View details",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            example: "d0e8c69eg298c87e3899119e025eff1f",
          },
          subprojectId: {
            type: "string",
            example: "rfe8er9eg298c87e3899119e025eff1f",
          },
        },
      },
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                parentProject: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                    displayName: { type: "string", example: "townproject" },
                  },
                },
                subproject: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                        creationUnixTs: { type: "string", example: "1536154645775" },
                        status: { type: "string", example: "open" },
                        displayName: { type: "string", example: "school" },
                        description: { type: "string", example: "school should be built" },
                        amount: { type: "string", example: "3000" },
                        assignee: { type: "string", example: "aSmith" },
                        currency: { type: "string", example: "EUR" },
                        thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                      },
                    },
                    log: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          key: { type: "string" },
                          intent: { type: "string", example: "global.createProject" },
                          createdBy: { type: "string", example: "aSmith" },
                          createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                          dataVersion: { type: "string", example: "1" },
                          data: {
                            type: "object",
                            properties: {
                              subproject: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    example: "d0e8c69eg298c87e3899119e025eff1f",
                                  },
                                  creationUnixTs: { type: "string", example: "1536154645775" },
                                  status: { type: "string", example: "open" },
                                  displayName: { type: "string", example: "school" },
                                  description: {
                                    type: "string",
                                    example: "school should be built",
                                  },
                                  amount: { type: "string", example: "3000" },
                                  assignee: { type: "string", example: "aSmith" },
                                  currency: { type: "string", example: "EUR" },
                                  thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                                },
                              },
                              permissions: {
                                type: "object",
                                additionalProperties: true,
                                example: {
                                  "subproject.intent.listPermissions": ["aSmith", "jDoe"],
                                },
                              },
                              snapshot: {
                                type: "object",
                                properties: {
                                  displayName: { type: "string", example: "school" },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    allowedIntents: { type: "array", items: { type: "string" } },
                  },
                },
                workflowitems: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: true,
                    example: { myWorkflowItems: {} },
                  },
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getSubprojectAssignSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Assign a subproject to a given user. The assigned user will be notified about the change.",
      tags: ["subproject"],
      summary: "Assign a user or group to a subproject",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
            },
            required: ["identity", "subprojectId", "projectId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getSubprojectUpdateSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Partially update a subproject. Only properties mentioned in the request body are touched, " +
        "others are not affected. The assigned user will be notified about the change.",
      tags: ["subproject"],
      summary: "Update a subproject",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              displayName: { type: "string", example: "school" },
              description: { type: "string", example: "school should be built" },
              amount: { type: "string", example: "3000" },
              assignee: { type: "string", example: "aSmith" },
              currency: { type: "string", example: "EUR" },
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
            },
            required: ["subprojectId", "projectId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
export function getSubprojectCloseSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Set a subproject's status to 'closed' if, and only if, all " +
        "associated workflowitems are already set to 'closed'.",
      tags: ["subproject"],
      summary: "Close a subproject",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
            },
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getReorderWorkflowitemsSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Set a new workflowitem ordering. Workflowitems not included in the list " +
        "will be ordered by their creation time and placed after all explicitly ordered workflowitems.",
      tags: ["subproject"],
      summary: "Reorder the workflowitems of the given subproject",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
              ordering: {
                type: "array",
                items: {
                  type: "string",
                  example: "56z9ki1ca780434a58b0752f3470301",
                },
              },
            },
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getCreateWorkflowitemSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Create a workflowitem and associate it to the given subproject.\n.\n" +
        "Note that the only possible values for 'amountType' are: 'disbursed', 'allocated', 'N/A'\n.\n" +
        "The only possible values for 'status' are: 'open' and 'closed'",
      tags: ["subproject"],
      summary: "Create a workflowitem",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
              status: { type: "string", example: "open" },
              displayName: { type: "string", example: "classroom" },
              description: { type: "string", example: "build classroom" },
              amount: { type: ["string", "null"], example: "500" },
              assignee: { type: "string", example: "aSmith" },
              currency: { type: ["string", "null"], example: "EUR" },
              amountType: { type: "string", example: "disbursed" },
              documents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "classroom-contract" },
                    base64: { type: "string", example: "dGVzdCBiYXNlNjRTdHJpbmc=" },
                  },
                },
              },
            },
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                created: { type: "boolean", example: "true" },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getSubprojectViewHistorySchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "View the history of a given subproject (filtered by what the user is allowed to see).",
      tags: ["subproject"],
      summary: "View history",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
          subprojectId: {
            type: "string",
          },
        },
      },
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                events: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      key: { type: "string" },
                      intent: { type: "string", example: "global.createProject" },
                      createdBy: { type: "string", example: "aSmith" },
                      createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                      dataVersion: { type: "string", example: "1" },
                      data: {
                        type: "object",
                        additionalProperties: true,
                        example: {
                          subproject: {
                            id: "er58c69eg298c87e3899119e025eff1f",
                            creationUnixTs: "1536834568552",
                            status: "open",
                            displayName: "school",
                            description: "school should be built",
                            amount: "500",
                            currency: "EUR",
                            assignee: "aSmith",
                          },
                        },
                        properties: {
                          permissions: {
                            type: "object",
                            additionalProperties: true,
                            example: { "subproject.intent.listPermissions": ["aSmith", "jDoe"] },
                          },
                        },
                      },
                      snapshot: {
                        type: "object",
                        properties: {
                          displayName: { type: "string", example: "classroom" },
                          amountType: { type: "string", example: "disbursed" },
                          amount: { type: "string", example: "500" },
                          currency: { type: "string", example: "EUR" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getSubprojectListPermissionsSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "See the permissions for a given subproject.",
      tags: ["subproject"],
      summary: "List all permissions",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            example: "er58c69eg298c87e3899119e025eff1f",
          },
          subprojectId: {
            type: "string",
            example: "4j28c69eg298c87e3899119e025eff1f",
          },
        },
      },
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              additionalProperties: true,
              example: {
                "project.viewDetails": ["aSmith", "jDoe"],
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getSubprojectGrantPermissionSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Grant a permission to a user. After this call has returned, the " +
        "user will be allowed to execute the given intent.",
      tags: ["subproject"],
      summary: "Grant a permission to a user or group",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: { type: "string", example: "global.createProject" },
              projectId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "3r28c69eg298c87e3899119e025eff1f" },
            },
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getRevokePermissionSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Revoke a permission from a user. After this call has returned, the " +
        "user will no longer be able to execute the given intent.",
      tags: ["subproject"],
      summary: "Revoke a permission to a user or group",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: { type: "string", example: "global.createProject" },
              projectId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "t628c69eg298c87e3899119e025eff1f" },
            },
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

// ------------------------------------------------------------
//       workflowitem
// ------------------------------------------------------------

export function getWorkflowItemListSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Retrieve all workflowitems of a given subproject. Those items the " +
        "user is not allowed to see will be redacted, that is, most of their values will be " +
        "set to null.",
      tags: ["workflowitem"],
      summary: "List all workflowitems of a given subproject",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
          subprojectId: {
            type: "string",
          },
        },
      },
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                workflowitems: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
                          creationUnixTs: { type: "string", example: "1536154645775" },
                          status: { type: "string", example: "open" },
                          amountType: { type: "string", example: "disbursed" },
                          displayName: { type: "string", example: "classroom" },
                          description: { type: "string", example: "build a classroom" },
                          amount: { type: "string", example: "500" },
                          assignee: { type: "string", example: "aSmith" },
                          currency: { type: "string", example: "EUR" },
                          documents: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string", example: "classroom-contract" },
                                hash: {
                                  type: "string",
                                  example:
                                    "F315FAA31B5B70089E7F464E718191EAF5F93E61BB5FDCDCEF32AF258B80B4B2",
                                },
                              },
                            },
                          },
                        },
                      },
                      allowedIntents: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  } as Schema;
}

export function getWorkflowitemAssignSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Assign a workflowitem to a given user. The assigned user will be notified about the change.",
      tags: ["workflowitem"],
      summary: "Assign a user or group to a workflowitem",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              projectId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "e528c69eg298c87e3899119e025eff1f" },
              workflowitemId: { type: "string", example: "9w88c69eg298c87e3899119e025eff1f" },
            },
            required: ["identity", "workflowitemId", "subprojectId", "projectId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getWorkflowitemUpdateSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Partially update a workflowitem. Only properties mentioned in the request body are touched, " +
        "others are not affected. The assigned user will be notified about the change.\n" +
        "Note that the only possible values for 'amountType' are: 'disbursed', 'allocated', 'N/A'\n.\n" +
        "The only possible values for 'status' are: 'open' and 'closed'",
      tags: ["workflowitem"],
      summary: "Update a workflowitem",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              displayName: { type: "string", example: "classroom" },
              description: { type: "string", example: "build a classroom" },
              amountType: { type: "string", example: "disbursed" },
              amount: { type: "string", example: "500" },
              assignee: { type: "string", example: "aSmith" },
              currency: { type: "string", example: "EUR" },
              projectId: { type: "string", example: "3r28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "5t28c69eg298c87e3899119e025eff1f" },
              workflowitemId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
              documents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "myId" },
                    base64: {
                      type: "string",
                      example: "aGVsbG8gdGhpcyBpcyBhIHRlc3QgZm9yIHRoZSBhcGkgZG9j",
                    },
                  },
                },
              },
            },
            required: ["workflowitemId", "subprojectId", "projectId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getWorkflowitemCloseSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "Set a workflowitem's status to 'closed'.",
      tags: ["workflowitem"],
      summary: "Close a workflowitem",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              projectId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er28c69eg298c87e3899119e025eff1f" },
              workflowitemId: { type: "string", example: "5z28c69eg298c87e3899119e025eff1f" },
            },
            required: ["workflowitemId", "subprojectId", "projectId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getWorkflowitemListPermissionsSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "See the permissions for a given workflowitem.",
      tags: ["workflowitem"],
      summary: "List all permissions",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            example: "4j28c69eg298c87e3899119e025eff1f",
          },
          subprojectId: {
            type: "string",
            example: "5t28c69eg298c87e3899119e025eff1f",
          },
          workflowitemId: {
            type: "string",
            example: "6z28c69eg298c87e3899119e025eff1f",
          },
        },
      },
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              additionalProperties: true,
              example: {
                "project.viewDetails": ["aSmith", "jDoe"],
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getWorkflowitemGrantPermissionSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Grant a permission to a user. After this call has returned, the " +
        "user will be allowed to execute the given intent.",
      tags: ["workflowitem"],
      summary: "Grant a permission to a user or group",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        additionalProperties: false,
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: { type: "string", example: "global.createProject" },
              projectId: { type: "string", example: "5t28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "6z28c69eg298c87e3899119e025eff1f" },
              workflowitemId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
            },
            required: ["identity", "intent", "workflowitemId", "subprojectId", "projectId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getWorkflowitemRevokePermissionSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Revoke a permission from a user. After this call has returned, the " +
        "user will no longer be able to execute the given intent.",
      tags: ["workflowitem"],
      summary: "Revoke a permission from a user or group",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: { type: "string", example: "global.createProject" },
              projectId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "5t28c69eg298c87e3899119e025eff1f" },
              workflowitemId: { type: "string", example: "6z28c69eg298c87e3899119e025eff1f" },
            },
            required: ["identity", "intent", "workflowitemId", "subprojectId", "projectId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getValidateDocumentSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "Validates if the hashed base64 string equals the hash sent by the user.",
      tags: ["workflowitem"],
      summary: "Validate a document",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              base64String: {
                type: "string",
                example: "aGVsbG8gdGhpcyBpcyBhIHRlc3QgZm9yIHRoZSBhcGkgZG9j",
              },
              hash: {
                type: "string",
                example: "F315FAA31B5B70089E7F464E718191EAF5F93E61BB5FDCDCEF32AF258B80B4B2",
              },
            },
            required: ["base64String", "hash"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                isIdentical: { type: "boolean", example: true },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

// ------------------------------------------------------------
//       notification
// ------------------------------------------------------------

export function getNotficationListSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "List notifications for the user, given by the token in the " +
        "request's `Authorization` header. By default, the response includes _all_ notifications, " +
        "but the `sinceId` parameter may be used to truncate the output.",
      tags: ["notification"],
      summary: "List all notification of the authorized user",
      security: [
        {
          bearerToken: [],
        },
      ],
      querystring: {
        type: "object",
        properties: {
          sinceId: {
            type: "string",
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                notifications: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      notificationId: { type: "string" },
                      resources: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string", example: "fe9c2b24ade9a92360b3a898665678ac" },
                            type: { type: "string", example: "workflowitem" },
                            displayName: { type: "string", example: "classroom" },
                          },
                        },
                      },
                      isRead: { type: "boolean" },
                      originalEvent: {
                        type: "object",
                        properties: {
                          key: { type: "string" },
                          intent: { type: "string", example: "global.createProject" },
                          createdBy: { type: "string", example: "aSmith" },
                          createdAt: { type: "string", example: "2018-09-24T12:02:58.763Z" },
                          dataVersion: { type: "string", example: "1" },
                          data: {
                            type: "object",
                            additionalProperties: true,
                            example: {
                              project: {
                                id: "fe9c2b24ade9a92360b3a898665678ac",
                                creationUnixTs: "1536834480274",
                                status: "open",
                                displayName: "town-project",
                                description: "a town should be built",
                                amount: "10000",
                                assignee: "aSmith",
                                currency: "EUR",
                                thumbnail: "/Thumbnail_0001.jpg",
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getNotificationMarkReadSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Allows a user to mark any of his/her notifications as read, which " +
        "is then reflected by the `isRead` flag carried in the `notification.list` response.",
      tags: ["notification"],
      summary: "Mark all notification as read",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              notificationId: { type: "string", example: "c9a6d74d-9508-4960-b39e-72f90f292b74" },
            },
            required: ["notificationId"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

// ------------------------------------------------------------
//       network
// ------------------------------------------------------------

export function getRegisterNodeSchema(): Schema {
  return {
    schema: {
      description: "Used by non-master MultiChain nodes to register their wallet address.",
      tags: ["network"],
      summary: "Register a node",
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              address: { type: "string", example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM" },
              organization: { type: "string", example: "Alice's Solutions & Co" },
            },
            required: ["address", "organization"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getVoteForPermissionSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Votes for granting/revoking network-level permissions to/from a " +
        "registered node (identified by its wallet addresses). After this call, the voted " +
        "access level may or may not be in effect, depending on the consensus parameters of " +
        "the underlying blockchain.",
      tags: ["network"],
      summary: "Vote for permission",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              address: { type: "string", example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM" },
              vote: { type: "string", example: "admin" },
            },
            required: ["address", "vote"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getapproveNewOrganizationSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "Approves a new organization if there are enough votes.",
      tags: ["network"],
      summary: "Approve a new organization",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              organization: { type: "string", example: "Alice's Solutions & Co" },
            },
            required: ["organization"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getapproveNewNodeForExistingOrganizationSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "Approves a new node for an existing organization." +
        " This organization doesn't have to go throught the voting system again",
      tags: ["network"],
      summary: "Approve a new node",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              address: { type: "string", example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM" },
            },
            required: ["address"],
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
        409: {
          description:
            "Tells either your organization has already voted or the permissions are already assigned",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "409" },
                message: { type: "string", example: "User already exists." },
              },
            },
          },
        },
      },
    },
  };
}

export function getNetworkListSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "List all nodes.",
      tags: ["network"],
      summary: "List all nodes",
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                nodes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      address: {
                        type: "object",
                        properties: {
                          address: {
                            type: "string",
                            example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM",
                          },
                          organization: { type: "string", example: "Alice's Solutions & Co" },
                        },
                      },
                      myVote: { type: "string", example: "admin" },
                      currentAccess: {
                        type: "object",
                        properties: {
                          accessType: { type: "string", example: "admin" },
                          approvers: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                address: {
                                  type: "string",
                                  example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM",
                                },
                                organization: {
                                  type: "string",
                                  example: "Alice's Solutions & Co",
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getListActiveSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "Get the number of all peers in the blockchain network.",
      tags: ["network"],
      summary: "List all active peers",
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                peers: { type: "string", example: "56" },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}

export function getCreateBackupSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description: "Create a backup",
      tags: ["system"],
      summary: "Create a Backup",
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "file download backup.gz",
          type: "string",
          format: "binary",
          example: "backup.gz",
        },
      },
    },
  };
}
export function getrestoreBackupSchema(server): Schema {
  return {
    // @ts-ignore: Unreachable code error
    beforeHandler: [server.authenticate],
    schema: {
      description:
        "To restore a backup send a valid backup.gz file as binary via an API-Testing-Tool like postman." +
        "Use 'application/gzip' as content type header)",
      tags: ["system"],
      summary: "Restore a Backup",
      security: [
        {
          bearerToken: [],
        },
      ],
      consumes: ["application/gzip"],
      body: {
        description: "binary gzip file",
        type: "string",
        format: "binary",
        example: "backup.gz (send a backup-file as binary via an API-Testing-Tool like postman)",
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "string",
              example: "OK",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  };
}
