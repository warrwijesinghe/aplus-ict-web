FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_APP_NAME="A Plus ICT"
ARG VITE_APP_ENV=production
ARG VITE_API_URL=/api
ARG VITE_API_TIMEOUT_MS=10000
ARG VITE_ENABLE_API_DEBUG=false
ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_API_URL=$VITE_API_URL \
    VITE_API_TIMEOUT_MS=$VITE_API_TIMEOUT_MS \
    VITE_ENABLE_API_DEBUG=$VITE_ENABLE_API_DEBUG \
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1/health || exit 1
