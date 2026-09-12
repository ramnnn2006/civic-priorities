FROM node:26-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:26-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node server ./server
COPY --chown=node:node src ./src
USER node
EXPOSE 8080
CMD ["sh", "-c", "RUN_SERVER=true node --import tsx server/index.ts"]
