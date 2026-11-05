import {
  uploadDocument,
  getKnowledgeBaseDocuments,
  getDocumentById,
  deleteDocument,
} from "@/services/document.service";

import { ApiError } from "@/lib/api-error";
import { processDocument } from "@/services/document-processing.service";
import { successResponse } from "@/lib/api-response";

// Upload a document
export async function uploadDocumentController(
  owner,
  file,
  knowledgeBaseId
) {
  if (!knowledgeBaseId) {
    throw new ApiError(400, "Knowledge base ID is required");
  }

  const document = await uploadDocument({
    file,
    knowledgeBaseId,
    owner,
  });

  return successResponse(
    document,
    "Document uploaded successfully",
    201
  );
}

// List documents inside a knowledge base
export async function getDocumentsController(owner, knowledgeBaseId) {
  if (!knowledgeBaseId) {
    throw new ApiError(400, "Knowledge base ID is required");
  }

  const documents = await getKnowledgeBaseDocuments(
    knowledgeBaseId,
    owner
  );

  return successResponse(
    documents,
    "Documents retrieved successfully"
  );
}

// Retrieve a single document
export async function getDocumentController(owner, documentId) {
  if (!documentId) {
    throw new ApiError(400, "Document ID is required");
  }

  const document = await getDocumentById(documentId, owner);

  return successResponse(
    document,
    "Document retrieved successfully"
  );
}

// Process an uploaded document
export async function processDocumentController(owner, documentId, options = {}) {
  if (!documentId) {
    throw new ApiError(400, "Document ID is required");
  }

  const result = await processDocument(documentId, owner, options);

  return successResponse(
    result,
    "Document processed successfully"
  );
}

// Delete a document and its associated chunks and storage file
export async function deleteDocumentController(owner, documentId) {
  if (!documentId) {
    throw new ApiError(400, "Document ID is required");
  }

  const result = await deleteDocument(documentId, owner);

  return successResponse(
    result,
    "Document deleted successfully"
  );
}
