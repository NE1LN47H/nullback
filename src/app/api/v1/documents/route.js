import connectDB from "@/config/db";
import {
  uploadDocumentController,
  getDocumentsController,
} from "@/controllers/document.controller";

import { withAuth } from "@/middleware/with-auth";
import { ApiError } from "@/lib/api-error";
import { handleError } from "@/lib/handle-error";

// POST: Upload a document
export const POST = withAuth(async (request, { authUser }) => {
  try {
    await connectDB();

    const formData = await request.formData();

    const file = formData.get("file");
    const knowledgeBaseId = formData.get("knowledgeBaseId");

    if (typeof knowledgeBaseId !== "string") {
      throw new ApiError(400, "Knowledge base ID is required");
    }

    if (!file || typeof file === "string") {
      throw new ApiError(400, "Document file is required");
    }

    return await uploadDocumentController(
      authUser.userId,
      file,
      knowledgeBaseId
    );
  } catch (error) {
    return handleError(error);
  }
});

// GET: List documents
export const GET = withAuth(async (request, { authUser }) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const knowledgeBaseId = searchParams.get("knowledgeBaseId");

    if (!knowledgeBaseId) {
      throw new ApiError(400, "Knowledge base ID is required");
    }

    return await getDocumentsController(
      authUser.userId,
      knowledgeBaseId
    );
  } catch (error) {
    return handleError(error);
  }
});