FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app ./
EXPOSE 8080
CMD ["node", "dist/server.js"]
