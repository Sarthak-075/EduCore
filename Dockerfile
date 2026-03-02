# multi-stage build for frontend + backend

# build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm ci
COPY . .
RUN npm run build

# build backend
FROM node:20-alpine AS backend-build
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
WORKDIR /app/backend
RUN npm ci
COPY backend .
RUN npm run build

# final image
FROM node:20-alpine AS runner
WORKDIR /app

# copy backend dist and node_modules
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/node_modules ./node_modules

# copy frontend assets into public folder
COPY --from=frontend-build /app/dist ./public

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/index.js"]
