# Node 22 is required (the built-in SQLite database).
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# Database and uploaded files. Mount a persistent volume here (see README).
RUN mkdir -p /app/data && chown -R node:node /app/data
VOLUME ["/app/data"]
USER node
EXPOSE 3000
CMD ["node", "--no-warnings", "dist/server.cjs"]
