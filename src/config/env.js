/**
 * Environment Configuration & Startup Validation
 *
 * Enforces fail-fast validation on all critical environment secrets
 * to prevent half-configured deployments.
 */

const requiredEnvVariables = [
  "MONGODB_URI",
  "JWT_SECRET",
  "ENCRYPTION_MASTER_KEY",
];

const missing = [];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    missing.push(variable);
  }
}

if (missing.length > 0) {
  throw new Error(
    `[Nullback Startup Error] Missing required environment variable(s): ${missing.join(", ")}`
  );
}

const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  ENCRYPTION_MASTER_KEY: process.env.ENCRYPTION_MASTER_KEY,
  ATLAS_VECTOR_INDEX_NAME: process.env.ATLAS_VECTOR_INDEX_NAME || "vector_index",
};

export default env;
