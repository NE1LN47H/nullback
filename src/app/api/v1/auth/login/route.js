import connectDB from "@/config/db";
import { loginController } from "@/controllers/auth.controller";
import { handleError } from "@/lib/handle-error";

export async function POST(request) {
  try {
    await connectDB();

    return await loginController(request);
  } catch (error) {
    return handleError(error);
  }
}