# ---------- Base dependencies stage ----------
FROM node:20.16-alpine AS deps
# consider updating to latest patch for security fixes
LABEL org.opencontainers.image.source="https://github.com/k1ngErr0r/OpenVulog" \
      org.opencontainers.image.title="OpenVulog Backend" \
      org.opencontainers.image.description="Backend service for OpenVulog vulnerability tracking" \
      org.opencontainers.image.licenses="MIT"
WORKDIR /app
COPY package*.json ./
# Use npm ci for clean, reproducible installs; omit dev deps for production
RUN npm ci --omit=dev

# ---------- Runtime image ----------
FROM node:20.16-alpine AS runtime
# keep in sync with deps stage
WORKDIR /app
ENV NODE_ENV=production
# Add non-root user for security
RUN addgroup -S nodegrp && adduser -S nodeuser -G nodegrp \
      && mkdir -p /app/logs /app/uploads \
      && chown -R nodeuser:nodegrp /app/logs /app/uploads
COPY --from=deps /app/node_modules ./node_modules
COPY . .
 # Ensure logs directory still owned correctly after copy (in case of local logs folder)
RUN chown -R nodeuser:nodegrp /app/logs /app/uploads || true
USER nodeuser
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3001/healthz || exit 1
CMD ["node", "server.js"]
