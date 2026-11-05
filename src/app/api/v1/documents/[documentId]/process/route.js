import connectDB from "@/config/db";
import { processDocumentController } from "@/controllers/document.controller";
import { withAuth } from "@/middleware/with-auth";
import { handleError } from "@/lib/handle-error";

// POST /api/v1/documents/[documentId]/process
// Triggers extraction, cleaning, chunking, and persistence for an uploaded document
export const POST = withAuth(async (request, { authUser, params }) => {
  try {
    await connectDB();

    const { documentId } = await params;
    const body = await request.json().catch(() => ({}));

    return await processDocumentController(
      authUser.userId,
      documentId,
      body
    );
  } catch (error) {
    return handleError(error);
  }
});

