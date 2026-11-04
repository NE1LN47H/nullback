import connectDB from "@/config/db";
import { successResponse } from "@/lib/api-response";
import { handleError } from "@/lib/handle-error";

export async function GET() {
  try {
    await connectDB();

    return successResponse(
      {
        database: "Connected",
        service: "Nullback API",
      },
      "API is healthy"
    );
  } catch (error) {
    return handleError(error);
  }
}