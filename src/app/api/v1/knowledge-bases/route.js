import connectDB from "@/config/db";
import { withAuth } from "@/middleware/with-auth";

import {
  createKnowledgeBaseController,
  getProjectKnowledgeBasesController,
} from "@/controllers/knowledge-base.controller";

export const POST = withAuth(async (request, { authUser }) => {
  await connectDB();

  return await createKnowledgeBaseController(request, authUser);
});

export const GET = withAuth(async (request, { authUser }) => {
  await connectDB();

  return await getProjectKnowledgeBasesController(request, authUser);
});