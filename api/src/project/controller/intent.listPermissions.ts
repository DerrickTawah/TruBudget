import { throwIfUnauthorized } from "../../authz";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import * as Project from "../model/Project";

export async function getProjectPermissions(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  const input = req.query;

  const projectId = value("projectId", input.projectId, isNonemptyString);

  const projectPermissions = await Project.getPermissions(multichain, projectId);

  // Is the user allowed to list project permissions?
  await throwIfUnauthorized(req.token, "project.intent.listPermissions", projectPermissions);

  return [
    200,
    {
      apiVersion: "1.0",
      data: projectPermissions,
    },
  ];
}