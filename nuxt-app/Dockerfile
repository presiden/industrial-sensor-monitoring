# =========================
# 1️⃣ Build stage
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# copy dependency files
COPY package.json package-lock.json* ./

# install deps (exact versions)
RUN npm install

# copy source
COPY . .

# build nuxt
RUN npm run build


# =========================
# 2️⃣ Runtime stage
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# copy only what we need
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# start nitro server
CMD ["node", ".output/server/index.mjs"]
