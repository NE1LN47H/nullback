import connectDB from "@/config/db";
import { withAuth } from "@/middleware/with-auth";

import {
  getKnowledgeBaseByIdController,
  updateKnowledgeBaseController,
  deleteKnowledgeBaseController,
} from "@/controllers/knowledge-base.controller";

// GET: Retrieve one knowledge base
export const GET = withAuth(async (request, { authUser, params }) => {
  await connectDB();

  const { knowledgeBaseId } = await params;

  return await getKnowledgeBaseByIdController(
    request,
    authUser,
    knowledgeBaseId
  );
});

// PATCH: Update a knowledge base
export const PATCH = withAuth(async (request, { authUser, params }) => {
  await connectDB();

  const { knowledgeBaseId } = await params;

  return await updateKnowledgeBaseController(
    request,
    authUser,
    knowledgeBaseId
  );
});

// DELETE: Delete a knowledge base
export const DELETE = withAuth(async (request, { authUser, params }) => {
  await connectDB();

  const { knowledgeBaseId } = await params;

  return await deleteKnowledgeBaseController(
    request,
    authUser,
    knowledgeBaseId
  );
});