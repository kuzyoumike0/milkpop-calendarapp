# syntax=docker/dockerfile:1.4

# ====== 依存関係インストール用ステージ ======
FROM node:18-alpine AS deps
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# npm キャッシュを正しい形式でマウントして依存関係をインストール
# Railway推奨: idにプロジェクト名などのプレフィックスを付与
RUN --mount=type=cache,id=myproject-frontend-npm,target=/root/.npm \
    npm ci --legacy-peer-deps

# ====== ビルドステージ ======
FROM node:18-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ビルド
RUN npm run build

# ====== 実行ステージ ======
FROM nginx:alpine AS runner

# Reactビルド成果物をnginxに配置
COPY --from=build /app/build /usr/share/nginx/html

# nginx設定（キャッシュ無効化やSPA対応する場合は修正）
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
