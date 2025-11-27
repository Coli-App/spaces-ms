#  ----- Stage 1 / Build ----- 
FROM node:22.21-alpine AS build

WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .

RUN pnpm build

# ----- Stage 2 / Production -----
FROM node:22.21-alpine AS production

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

COPY package.json pnpm-lock.yaml ./

EXPOSE 3000
CMD ["node", "dist/main.js"]