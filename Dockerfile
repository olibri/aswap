
FROM node:23-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ——— Runtime — serve 
FROM node:23-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
USER node      
CMD ["serve", "-s", "dist", "-l", "3000"]
