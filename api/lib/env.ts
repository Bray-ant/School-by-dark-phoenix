import "dotenv/config";

console.log("[env] NODE_ENV:", process.env.NODE_ENV);
console.log("[env] available keys:", Object.keys(process.env).sort().join(", "));
console.log("[env] DATABASE_URL length:", process.env.DATABASE_URL?.length ?? 0);
console.log("[env] SESSION_SECRET length:", process.env.SESSION_SECRET?.length ?? 0);

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  sessionSecret: required("SESSION_SECRET"),
  kimiOpenUrl: process.env.KIMI_OPEN_URL ?? "https://open.kimi.com",
  kimiApiKey: process.env.KIMI_API_KEY ?? "",
  smtpHost: process.env.SMTP_HOST ?? "smtp.gmail.com",
  smtpPort: parseInt(process.env.SMTP_PORT ?? "587", 10),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  fromEmail: process.env.FROM_EMAIL ?? "",
};
