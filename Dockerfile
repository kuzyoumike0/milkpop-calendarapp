# =============================
# 1. フロントエンドビルドステージ
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY frontend/ ./
RUN npm run build

# =============================
# 2. バックエンドビルドステージ
# =============================
FROM node:18 AS backend-build
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY backend/ ./

# =============================
# 3. 本番ステージ
# =============================
FROM node:18
WORKDIR /app

COPY --from=backend-build /app/backend ./
COPY --from=frontend-build /app/frontend/build ./public

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV PORT=8080

EXPOSE 8080
CMD ["node", "index.js"]
