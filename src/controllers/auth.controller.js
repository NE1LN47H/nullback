import { registerUser } from "@/services/auth.service";
import { loginUser } from "@/services/auth.service";
import { successResponse } from "@/lib/api-response";
import { handleError } from "@/lib/handle-error";
import { ApiError } from "@/lib/api-error";
import User from "@/models/User";


export async function registerController(request) {
  try {
    // 1. Read request body
    let body;

    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, "Invalid JSON request body");
    }

    const { name, email, password } = body || {};

    // 2. Validate input
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      throw new ApiError(400, "Name, email and password are required");
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 80) {
      throw new ApiError(400, "Name must be between 2 and 80 characters");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new ApiError(400, "Please provide a valid email address");
    }

    if (password.length < 8 || password.length > 128) {
      throw new ApiError(400, "Password must be between 8 and 128 characters");
    }

    // 3. Call registration service
    const user = await registerUser({
      name: cleanName,
      email: cleanEmail,
      password,
    });

    // 4. Return response
    return successResponse(
      { user },
      "Account created successfully",
      201
    );

  } catch (error) {
    // Handle duplicate email race condition
    if (error.code === 11000) {
      return handleError(
        new ApiError(409, "Email already registered")
      );
    }

    return handleError(error);
  }
}

export async function loginController(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, "Invalid JSON request body");
    }

    const { email, password } = body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      throw new ApiError(400, "Email and password are required");
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new ApiError(400, "Please provide a valid email address");
    }

    if (password.length < 8 || password.length > 128) {
      throw new ApiError(400, "Invalid email or password");
    }

    const result = await loginUser({
    email: cleanEmail,
    password,
    });

    return successResponse(
    result,
    "Login successful"
    );

  } catch (error) {
    return handleError(error);
  }
}

export async function getCurrentUserController(authUser) {
  try {
  const user = await User.findById(authUser.userId);

  if (!user || !user.isActive) {
    throw new ApiError(401, "User account not found or inactive");
  }

  return successResponse(
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
    "User retrieved successfully"
  );
}

  catch (error) {
    return handleError(error);
  }
}
