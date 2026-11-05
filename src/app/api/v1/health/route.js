import connectDB from "@/config/db";
import { successResponse } from "@/lib/api-response";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Production Readiness & Health Diagnostic Endpoint
 *
 * Probes:
 * 1. MongoDB connectivity & ping round-trip latency
 * 2. Local filesystem storage read/write accessibility
 * 3. Master encryption key validation
 * 4. Process memory usage & uptime
 *
 * Returns:
 * - HTTP 200 OK when fully healthy
 * - HTTP 503 Service Unavailable if any core dependency is failing
 */
export async function GET() {
  const startTime = performance.now();
  const checks = {
    database: "unhealthy",
    databaseLatencyMs: 0,
    storage: "unhealthy",
    encryption: "unhealthy",
  };

  let isReady = true;

  // 1. Database Ping & Latency Check
  try {
    const dbStart = performance.now();
    await connectDB();
    const pingResult = await mongoose.connection.db.admin().ping();
    if (pingResult && pingResult.ok === 1) {
      checks.database = "healthy";
      checks.databaseLatencyMs = Math.round(performance.now() - dbStart);
    } else {
      isReady = false;
    }
  } catch (dbErr) {
    checks.database = `error: ${dbErr.message}`;
    isReady = false;
  }

  // 2. Storage Directory Write Readiness Check
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.access(UPLOAD_DIR, fs.constants.R_OK | fs.constants.W_OK);
    checks.storage = "healthy";
  } catch (storageErr) {
    checks.storage = `error: ${storageErr.message}`;
    isReady = false;
  }

  // 3. Encryption Master Key Validation
  if (
    process.env.ENCRYPTION_MASTER_KEY &&
    process.env.ENCRYPTION_MASTER_KEY.length >= 32
  ) {
    checks.encryption = "healthy";
  } else {
    checks.encryption = "misconfigured";
    isReady = false;
  }

  const memoryUsage = process.memoryUsage();
  const heapUsedMb =
    Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100;
  const totalLatencyMs = Math.round(performance.now() - startTime);

  const payload = {
    status: isReady ? "healthy" : "unhealthy",
    service: "Nullback Managed RAG Infrastructure",
    version: "0.1.0",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    latencyMs: totalLatencyMs,
    memory: {
      heapUsedMb,
    },
    checks,
  };

  if (!isReady) {
    return Response.json(
      {
        success: false,
        message: "One or more readiness probes failed",
        data: payload,
      },
      { status: 503 }
    );
  }

  return successResponse(payload, "API and dependencies are healthy");
}
