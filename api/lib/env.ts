import "dotenv/config";

function isNextBuild(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_PHASE === "phase-export"
  );
}

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production" && !isNextBuild()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  sessionSecret: required("SESSION_SECRET"),
  nvidiaApiKey: process.env.NVIDIA_API_KEY ?? "",
  nvidiaApiUrl: process.env.NVIDIA_API_URL ?? "https://integrate.api.nvidia.com/v1",
  nvidiaModel: process.env.NVIDIA_MODEL ?? "nvidia/nemotron-3-ultra-550b-a55b",
  googleAiKey: process.env.GOOGLE_AI_KEY ?? "",
  googleAiUrl: process.env.GOOGLE_AI_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai",
  googleAiModel: process.env.GOOGLE_AI_MODEL ?? "gemini-2.0-flash",
  kimiOpenUrl: process.env.KIMI_OPEN_URL ?? "https://open.kimi.com",
  kimiApiKey: process.env.KIMI_API_KEY ?? "",
  smtpHost: process.env.SMTP_HOST ?? "smtp.gmail.com",
  smtpPort: parseInt(process.env.SMTP_PORT ?? "587", 10),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  fromEmail: process.env.FROM_EMAIL ?? "",
  emailProvider: process.env.EMAIL_PROVIDER ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  sendgridApiKey: process.env.SENDGRID_API_KEY ?? "",
};
