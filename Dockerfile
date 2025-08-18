# === フロントエンドビルド ===
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係を先にコピーしてインストール
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# 追加でajvを明示的にインストール（react-scripts依存対策）
RUN npm install ajv@8 ajv-keywords@5 axios@1 --legacy-peer-deps

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# === バックエンド ===
FROM node:18 AS backend
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

COPY backend/ ./

# フロントのビルド成果物をコピー
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
