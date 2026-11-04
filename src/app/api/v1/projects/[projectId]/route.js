import connectDB from "@/config/db";
import { withAuth } from "@/middleware/with-auth";
import { getProjectByIdController } from "@/controllers/project.controller";
import { updateProjectController } from "@/controllers/project.controller";
import { deleteProjectController } from "@/controllers/project.controller";

export const GET = withAuth(async (request, { authUser, params }) => {
  await connectDB();

  const { projectId } = await params;

  return await getProjectByIdController(
    request,
    authUser,
    projectId
  );
});

export const PATCH = withAuth(async (request, { authUser, params }) => {
  await connectDB();

  const { projectId } = await params;

  return await updateProjectController(
    request,
    authUser,
    projectId
  );
});

export const DELETE = withAuth(async (request, { authUser, params }) => {
  await connectDB();

  const { projectId } = await params;

  return await deleteProjectController(
    authUser,
    projectId
  );
});