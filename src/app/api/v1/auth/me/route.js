import connectDB from "@/config/db";
import { getCurrentUserController } from "@/controllers/auth.controller";
import { withAuth } from "@/middleware/with-auth";

export const GET = withAuth(async (request, { authUser }) => {
  await connectDB();

  return await getCurrentUserController(authUser);
});