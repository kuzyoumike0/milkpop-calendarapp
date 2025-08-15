# syntax=docker/dockerfile:1.4

# ====== 依存関係インストール用ステージ ======
FROM node:18-alpine AS deps
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# npm キャッシュを正しい形式でマウントして依存関係をインストール
# Railway推奨: キャッシュキーにプロジェクト名プレフィックスを付与
RUN --mount=type=cache,id=railway-frontend-npm,target=/root/.npm \
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

# SPA対応 nginx 設定（必要なら修正）
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri /index.html;
    }

    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        root /usr/share/nginx/html;
        expires 6M;
        access_log off;
        add_header Cache-Control "public";
    }
}
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
