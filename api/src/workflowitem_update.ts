import { FastifyInstance } from "fastify";
import Joi = require("joi");
import { VError } from "verror";

import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import * as AdditionalData from "./service/domain/additional_data";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import * as Workflowitem from "./service/domain/workflow/workflowitem";
import * as WorkflowitemUpdate from "./service/workflowitem_update";
import { uploadedDocumentSchema, UploadedDocument } from "./service/domain/workflow/document";

interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    projectId: Project.Id;
    subprojectId: Subproject.Id;
    workflowitemId: Workflowitem.Id;
    displayName?: string;
    description?: string;
    amountType?: "N/A" | "disbursed" | "allocated";
    amount?: string;
    currency?: string;
    exchangeRate?: string;
    billingDate?: string;
    dueDate?: string;
    documents?: UploadedDocument[];
    additionalData?: object;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    projectId: Project.idSchema.required(),
    subprojectId: Subproject.idSchema.required(),
    workflowitemId: Workflowitem.idSchema.required(),
    displayName: Joi.string(),
    description: Joi.string().allow(""),
    amountType: Joi.string().valid("N/A", "disbursed", "allocated"),
    amount: Joi.string(),
    currency: Joi.string(),
    exchangeRate: Joi.string(),
    billingDate: Joi.date().iso(),
    dueDate: Joi.date().iso(),
    documents: Joi.array().items(uploadedDocumentSchema),
    additionalData: AdditionalData.schema,
  }).required(),
});

type RequestBody = RequestBodyV1;
const requestBodySchema = Joi.alternatives([requestBodyV1Schema]);

function validateRequestBody(body: any): Result.Type<RequestBody> {
  const { error, value } = Joi.validate(body, requestBodySchema);
  return !error ? value : error;
}

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    beforeHandler: [(server as any).authenticate],
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
      required: ["apiVersion", "data"],
      properties: {
        apiVersion: { type: "string", example: "1.0" },
        data: {
          type: "object",
          required: ["workflowitemId", "subprojectId", "projectId"],
          properties: {
            displayName: { type: "string", example: "classroom" },
            description: { type: "string", example: "build a classroom" },
            amountType: { type: "string", example: "disbursed" },
            amount: { type: "string", example: "500" },
            currency: { type: "string", example: "EUR" },
            exchangeRate: { type: "string", example: "1.0" },
            billingDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
            dueDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
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
            additionalData: { type: "object" },
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
      401: NotAuthenticated.schema,
    },
  };
}

interface Service {
  updateWorkflowitem(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    workflowitemId: Workflowitem.Id,
    data: WorkflowitemUpdate.ModificationWithDocumentBodies,
  ): Promise<void>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.post(`${urlPrefix}/workflowitem.update`, mkSwaggerSchema(server), (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const user: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
    };

    const bodyResult = validateRequestBody(request.body);

    if (Result.isErr(bodyResult)) {
      const { code, body } = toHttpError(new VError(bodyResult, "failed to update project"));
      reply.status(code).send(body);
      return;
    }

    const { projectId, subprojectId, workflowitemId, ...data } = bodyResult.data;

    service
      .updateWorkflowitem(ctx, user, projectId, subprojectId, workflowitemId, data)
      .then(() => {
        const code = 200;
        const body = {
          apiVersion: "1.0",
          data: "OK",
        };
        reply.status(code).send(body);
      })
      .catch(err => {
        const { code, body } = toHttpError(err);
        reply.status(code).send(body);
      });
  });
}
