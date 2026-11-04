
import connectDB from "@/config/db";
import { registerController } from "@/controllers/auth.controller";
import { handleError } from "@/lib/handle-error";

export async function POST(request) {
  try {
    await connectDB();

    return await registerController(request);
  } catch (error) {
    return handleError(error);
  }
}
