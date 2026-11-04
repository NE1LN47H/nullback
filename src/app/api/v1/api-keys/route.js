import connectDB from "@/config/db";
import { withAuth } from "@/middleware/with-auth";
import { createApiKeyController } from "@/controllers/api-key.controller";

export const POST = withAuth(async (request, { authUser }) => {
  await connectDB();

  return await createApiKeyController(request, authUser);
});

import { getUserApiKeysController } from "@/controllers/api-key.controller";

export const GET = withAuth(async (request, { authUser }) => {
  await connectDB();

  return await getUserApiKeysController(authUser);
});