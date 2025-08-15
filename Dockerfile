# ===== フロントエンドビルド =====
FROM node:18.20.1-bullseye AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,id=build-npm-frontend,target=/root/.npm \
    npm install --legacy-peer-deps

COPY frontend/ ./
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build

# ===== バックエンド =====
FROM node:18.20.1-bullseye
WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN --mount=type=cache,id=build-npm-backend,target=/root/.npm \
    npm install --legacy-peer-deps

COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
