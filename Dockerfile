# ==============================================================================
# STAGE 1: Build Dependencies
# Menginstal production dependencies menggunakan npm ci berbasis package-lock.json
# ==============================================================================
FROM node:20-alpine AS deps
WORKDIR /app

# Salin package manifest untuk optimasi layer caching Docker
COPY package.json package-lock.json ./

# Instal dependensi produksi saja tanpa development packages
RUN npm ci --omit=dev && npm cache clean --force

# ==============================================================================
# STAGE 2: Production Runner
# Menggunakan base image minimal dan user non-root untuk keamanan kontainer
# ==============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

# Atur variabel lingkungan produksi
ENV NODE_ENV=production
ENV PORT=3000

# Buat direktori dan pastikan izin kepemilikan untuk user 'node'
RUN chown -R node:node /app

# Salin dependensi dari stage deps
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Salin kode aplikasi dan aset frontend
COPY --chown=node:node package.json ./
COPY --chown=node:node src/ ./src/
COPY --chown=node:node public/ ./public/

# Jalankan kontainer menggunakan non-root user bawaan Alpine
USER node

# Expose port internal aplikasi
EXPOSE 3000

# Healthcheck internal kontainer aplikasi
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Entrypoint eksekusi server
CMD ["node", "src/server.js"]
