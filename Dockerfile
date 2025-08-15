# syntax=docker/dockerfile:1.4

################################
# 依存関係インストールステージ
################################
FROM node:18-alpine AS deps
WORKDIR /app

# package.json と package-lock.json をコピー（frontend配下にある場合はパスを変更）
COPY frontend/package*.json ./

# npm キャッシュをマウントして高速化
RUN --mount=type=cache,id=my-frontend-npm-cache,target=/root/.npm \
    npm ci --legacy-peer-deps

################################
# ビルドステージ
################################
FROM node:18-alpine AS build
WORKDIR /app

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules

# ソースコードをコピー
COPY frontend/ ./

# ビルド実行
RUN npm run build

################################
# 実行ステージ（nginx）
################################
FROM nginx:alpine AS runner

# カスタムnginx設定をコピー（SPA対応）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Reactのビルド成果物をnginxに配置
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
