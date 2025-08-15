# syntax=docker/dockerfile:1.4

# ====== 依存関係インストール用ステージ ======
FROM node:18-alpine AS deps
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# npm キャッシュをマウントして依存関係をインストール
RUN --mount=type=cache,id=myapp-frontend-npm,target=/root/.npm \
    npm ci --legacy-peer-deps

# ====== ビルドステージ ======
FROM node:18-alpine AS build
WORKDIR /app

# node_modules をコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# React ビルド
RUN npm run build

# ====== 実行ステージ ======
FROM nginx:alpine AS runner

# ビルド成果物を nginx に配置
COPY --from=build /app/build /usr/share/nginx/html

# nginx のポート解放
EXPOSE 80

# 起動コマンド
CMD ["nginx", "-g", "daemon off;"]
