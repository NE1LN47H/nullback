import connectDB from "@/config/db";
import {
  getDocumentController,
  deleteDocumentController,
} from "@/controllers/document.controller";
import { withAuth } from "@/middleware/with-auth";
import { handleError } from "@/lib/handle-error";

// GET /api/v1/documents/[documentId]
// Retrieve metadata for a single document
export const GET = withAuth(async (request, { authUser, params }) => {
  try {
    await connectDB();

    const { documentId } = await params;

    return await getDocumentController(
      authUser.userId,
      documentId
    );
  } catch (error) {
    return handleError(error);
  }
});

// DELETE /api/v1/documents/[documentId]
// Delete a document, its disk file, and all associated text chunks
export const DELETE = withAuth(async (request, { authUser, params }) => {
  try {
    await connectDB();

    const { documentId } = await params;

    return await deleteDocumentController(
      authUser.userId,
      documentId
    );
  } catch (error) {
    return handleError(error);
  }
});
