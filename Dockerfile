# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Copy built app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/api ./api
COPY --from=builder /app/db ./db
COPY --from=builder /app/contracts ./contracts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tailwind.config.js ./
COPY --from=builder /app/postcss.config.js ./
COPY --from=builder /app/components.json ./

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Render injects the PORT env var dynamically; Next.js reads it automatically.
EXPOSE 3000

# render.yaml's buildCommand is ignored when deploying via Dockerfile, so
# the database schema push has to happen at container startup instead,
# once DATABASE_URL is actually available in the runtime environment.
CMD ["sh", "-c", "npx drizzle-kit push --force && npx next start"]
