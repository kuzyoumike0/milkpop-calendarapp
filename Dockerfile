# syntax=docker/dockerfile:1.4

# ====== 依存関係インストール用ステージ ======
FROM node:18-alpine AS deps
WORKDIR /app

COPY package*.json ./

# Railway対応: キャッシュマウントIDにプレフィックスを付ける
RUN --mount=type=cache,id=myapp-frontend-npm,target=/root/.npm \
    npm ci --legacy-peer-deps

# ====== ビルドステージ ======
FROM node:18-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Reactビルド
RUN npm run build

# ====== 実行ステージ ======
FROM nginx:alpine AS runner

# SPA対応の nginx 設定をコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ビルド成果物を配置
COPY --from=build /app/build /usr/share/nginx/html

# Railway環境のPORT変数に対応
ENV PORT=80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
