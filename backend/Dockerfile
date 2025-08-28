# ---------- Base dependencies stage ----------
FROM node:18-alpine AS deps
LABEL org.opencontainers.image.source="https://github.com/k1ngErr0r/OpenVLog" \
      org.opencontainers.image.title="OpenVLog Backend" \
      org.opencontainers.image.description="Backend service for OpenVLog vulnerability tracking" \
      org.opencontainers.image.licenses="MIT"
WORKDIR /app
COPY package*.json ./
# Use npm ci for clean, reproducible installs; omit dev deps for production
RUN npm ci --omit=dev

# ---------- Runtime image ----------
FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Add non-root user for security
RUN addgroup -S nodegrp && adduser -S nodeuser -G nodegrp
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER nodeuser
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3001/healthz || exit 1
CMD ["node", "server.js"]
