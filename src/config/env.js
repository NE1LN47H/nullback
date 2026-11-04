const requiredEnvVariables = [
  "MONGODB_URI",
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `Missing environment variable: ${variable}`
    );
  }
}

const env = {
  MONGODB_URI: process.env.MONGODB_URI,
};

export default env;