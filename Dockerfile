# =============================
# 2. バックエンド
# =============================
FROM node:18 AS backend
WORKDIR /app/backend

ENV NODE_OPTIONS="--max-old-space-size=4096"

# 依存関係インストール
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps --omit=dev

# ソースコードをコピー
COPY backend/ ./

# フロントエンド成果物を配置
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
