import Document from "@/models/Document";
import Chunk from "@/models/Chunk";
import KnowledgeBase from "@/models/KnowledgeBase";
import EmbeddingConfig from "@/models/EmbeddingConfig";
import { extractDocumentText } from "@/services/document-parser.service";
import { cleanDocumentText } from "@/services/text-cleaner.service";
import { chunkDocumentText } from "@/services/chunking.service";
import { generateEmbeddings } from "@/services/embedding.service";
import { ApiError } from "@/lib/api-error";

/**
 * Complete RAG Document Ingestion & Vectorization Pipeline:
 * 1. Extraction: reads raw bytes from storage (PDF, DOCX, TXT, MD)
 * 2. Cleaning: unicode normalization and control character stripping
 * 3. Chunking: semantic recursive splitting with sliding-window overlap
 * 4. Embedding Resolution: binds to KnowledgeBase or Project default EmbeddingConfig
 * 5. Vectorization: calls embedding provider via batching & exponential backoff
 * 6. Persistence: writes chunks with vector arrays into MongoDB
 * 7. State Synchronization: updates Document metrics and marks as "processed"
 *
 * @param {string} documentId - ID of the document to process
 * @param {string} owner - User ID of document owner
 * @param {object} [options] - Optional processing overrides (chunkSize, chunkOverlap, embeddingConfigId, skipEmbedding)
 */
export async function processDocument(documentId, owner, options = {}) {
  const document = await Document.findOne({
    _id: documentId,
    owner,
  });

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  try {
    // 1. Mark document as processing and clear previous errors
    document.status = "processing";
    document.errorMessage = null;
    await document.save();

    // 2. Safe cleanup of any pre-existing chunks (enables idempotent retries & reprocessing)
    await Chunk.deleteMany({ document: document._id });

    // 3. Extract text from the stored file
    const extracted = await extractDocumentText(
      document.storageKey,
      document.mimeType
    );

    // 4. Clean and normalize the extracted text
    const cleanedText = cleanDocumentText(extracted.text);

    if (!cleanedText) {
      throw new Error("No readable text found in document");
    }

    // 5. Intelligent chunking
    const chunks = chunkDocumentText(cleanedText, {
      chunkSize: options.chunkSize,
      chunkOverlap: options.chunkOverlap,
    });

    if (chunks.length === 0) {
      throw new Error("Document produced zero text chunks");
    }

    // 6. Resolve Embedding Configuration
    let embeddingConfig = null;

    if (options.embeddingConfigId) {
      embeddingConfig = await EmbeddingConfig.findOne({
        _id: options.embeddingConfigId,
        owner,
      });
    }

    if (!embeddingConfig) {
      const kb = await KnowledgeBase.findOne({
        _id: document.knowledgeBase,
        owner,
      });

      if (kb?.embeddingConfig) {
        embeddingConfig = await EmbeddingConfig.findOne({
          _id: kb.embeddingConfig,
          owner,
        });
      }
    }

    if (!embeddingConfig) {
      embeddingConfig = await EmbeddingConfig.findOne({
        project: document.project,
        owner,
        isDefault: true,
      });
    }

    // 7. Vector generation
    let chunkEmbeddings = null;
    let tokensUsed = 0;

    if (embeddingConfig && !options.skipEmbedding) {
      const textList = chunks.map((c) => c.content);
      const embedResult = await generateEmbeddings(textList, embeddingConfig);
      chunkEmbeddings = embedResult.embeddings;
      tokensUsed = embedResult.totalTokens;
    }

    // 8. Map chunks to database documents with their vectors
    const chunkDocuments = chunks.map((chunk, idx) => ({
      document: document._id,
      knowledgeBase: document.knowledgeBase,
      project: document.project,
      owner: document.owner,
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      characterCount: chunk.characterCount,
      tokenCount: chunk.tokenCount,
      embedding: chunkEmbeddings ? chunkEmbeddings[idx] : undefined,
      metadata: {
        pageCount: extracted.pageCount,
        fileName: document.originalName,
        mimeType: document.mimeType,
      },
    }));

    // 9. Bulk insert chunks into MongoDB
    await Chunk.insertMany(chunkDocuments, { ordered: true });

    // 10. Update document metadata and mark as processed
    document.status = "processed";
    document.pageCount = extracted.pageCount;
    document.characterCount = cleanedText.length;
    document.chunkCount = chunks.length;

    await document.save();

    return {
      documentId: document._id,
      status: document.status,
      characterCount: document.characterCount,
      pageCount: document.pageCount,
      chunkCount: document.chunkCount,
      isVectorized: Boolean(chunkEmbeddings),
      embeddingModel: embeddingConfig?.model || null,
      tokensUsed,
    };
  } catch (error) {
    // 11. Failure handling: update document status and clean up partial chunks
    document.status = "failed";
    document.errorMessage = error.message;
    await document.save();

    await Chunk.deleteMany({ document: document._id }).catch(() => {});

    throw error;
  }
}
