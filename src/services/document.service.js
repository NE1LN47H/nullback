import Document from "@/models/Document";
import Chunk from "@/models/Chunk";
import KnowledgeBase from "@/models/KnowledgeBase";
import { saveFile, deleteFile } from "../../storage/local-storage";
import { validateDocument } from "@/validators/document.validator";
import mongoose from "mongoose";
import crypto from "crypto";
import { ApiError } from "@/lib/api-error";

export async function createDocument({
  name,
  originalName,
  mimeType,
  size,
  storageKey,
  fileHash = null,
  knowledgeBaseId,
  owner,
}) {
  // Validate knowledge base ID
  if (!mongoose.Types.ObjectId.isValid(knowledgeBaseId)) {
    throw new ApiError(400, "Invalid knowledge base ID");
  }

  // Verify knowledge base ownership
  const knowledgeBase = await KnowledgeBase.findOne({
    _id: knowledgeBaseId,
    owner,
  });

  if (!knowledgeBase) {
    throw new ApiError(404, "Knowledge base not found");
  }

  // Save document metadata
  const document = await Document.create({
    name,
    originalName,
    mimeType,
    size,
    storageKey,
    fileHash,
    knowledgeBase: knowledgeBase._id,
    project: knowledgeBase.project,
    owner,
    status: "uploaded",
  });

  return {
    id: document._id,
    name: document.name,
    originalName: document.originalName,
    mimeType: document.mimeType,
    size: document.size,
    fileHash: document.fileHash,
    knowledgeBase: document.knowledgeBase,
    status: document.status,
    createdAt: document.createdAt,
  };
}

export async function getKnowledgeBaseDocuments(
  knowledgeBaseId,
  owner
) {
  if (!mongoose.Types.ObjectId.isValid(knowledgeBaseId)) {
    throw new ApiError(400, "Invalid knowledge base ID");
  }

  // Verify knowledge base ownership
  const knowledgeBase = await KnowledgeBase.findOne({
    _id: knowledgeBaseId,
    owner,
  });

  if (!knowledgeBase) {
    throw new ApiError(404, "Knowledge base not found");
  }

  // Retrieve documents
  const documents = await Document.find({
    knowledgeBase: knowledgeBaseId,
    owner,
  })
    .sort({ createdAt: -1 })
    .select(
      "name originalName mimeType size fileHash status errorMessage pageCount characterCount chunkCount createdAt updatedAt"
    );

  return documents.map((document) => ({
    id: document._id,
    name: document.name,
    originalName: document.originalName,
    mimeType: document.mimeType,
    size: document.size,
    fileHash: document.fileHash,
    status: document.status,
    errorMessage: document.errorMessage,
    pageCount: document.pageCount,
    characterCount: document.characterCount,
    chunkCount: document.chunkCount,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  }));
}

export async function getDocumentById(documentId, owner) {
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, "Invalid document ID");
  }

  const document = await Document.findOne({
    _id: documentId,
    owner,
  }).select(
    "name originalName mimeType size fileHash knowledgeBase project status errorMessage pageCount characterCount chunkCount createdAt updatedAt"
  );

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  return {
    id: document._id,
    name: document.name,
    originalName: document.originalName,
    mimeType: document.mimeType,
    size: document.size,
    fileHash: document.fileHash,
    knowledgeBase: document.knowledgeBase,
    project: document.project,
    status: document.status,
    errorMessage: document.errorMessage,
    pageCount: document.pageCount,
    characterCount: document.characterCount,
    chunkCount: document.chunkCount,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export async function uploadDocument({
  file,
  knowledgeBaseId,
  owner,
}) {
  if (!file) {
    throw new ApiError(400, "Document file is required");
  }

  // 1. Read binary buffer and validate file constraints + magic byte signatures
  const buffer = Buffer.from(await file.arrayBuffer());
  validateDocument(file, buffer);

  const knowledgeBase = await KnowledgeBase.findOne({
    _id: knowledgeBaseId,
    owner,
  });

  if (!knowledgeBase) {
    throw new ApiError(404, "Knowledge base not found");
  }

  // 2. Compute cryptographic SHA-256 checksum for duplicate detection
  const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

  // 2. Duplicate detection: check if this file already exists in this knowledge base
  const existingDocument = await Document.findOne({
    knowledgeBase: knowledgeBase._id,
    owner,
    fileHash,
  });

  if (existingDocument) {
    throw new ApiError(
      409,
      `Duplicate document detected: an identical file "${existingDocument.name}" is already uploaded in this knowledge base`
    );
  }

  // 3. Save file using preloaded buffer (prevents writing duplicate bytes to disk)
  const storageKey = await saveFile(file, buffer);

  try {
    const document = await Document.create({
      name: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      storageKey,
      fileHash,
      knowledgeBase: knowledgeBase._id,
      project: knowledgeBase.project,
      owner,
      status: "uploaded",
    });

    return {
      id: document._id,
      name: document.name,
      originalName: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      fileHash: document.fileHash,
      knowledgeBase: document.knowledgeBase,
      status: document.status,
      createdAt: document.createdAt,
    };
  } catch (error) {
    await deleteFile(storageKey).catch(() => {});
    throw error;
  }
}

/**
 * Permanently deletes a document, removing its stored file from disk
 * and cascading deletion to all its stored chunks in MongoDB.
 *
 * @param {string} documentId - ID of document to delete
 * @param {string} owner - User ID of owner
 */
export async function deleteDocument(documentId, owner) {
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, "Invalid document ID");
  }

  const document = await Document.findOne({
    _id: documentId,
    owner,
  });

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  // 1. Delete physical file from storage adapter
  try {
    await deleteFile(document.storageKey);
  } catch (error) {
    console.warn(`File deletion warning for key ${document.storageKey}:`, error.message);
  }

  // 2. Cascade delete all chunks belonging to this document
  await Chunk.deleteMany({ document: document._id });

  // 3. Delete document record from MongoDB
  await Document.deleteOne({ _id: document._id });

  return {
    id: document._id,
    name: document.name,
    deleted: true,
  };
}
