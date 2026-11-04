import connectDB from "@/config/db";
import { withAuth } from "@/middleware/with-auth";
import { createProjectController } from "@/controllers/project.controller";
import { getUserProjectsController } from "@/controllers/project.controller";

export const POST = withAuth(async (request, { authUser }) => {
  await connectDB();

  return await createProjectController(request, authUser);
});

export const GET = withAuth(async (request, { authUser }) => {
  await connectDB();

  return await getUserProjectsController(authUser);
});