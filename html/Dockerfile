FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts

FROM deps AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
