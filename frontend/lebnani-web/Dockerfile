FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build


FROM nginx:alpine

RUN addgroup --system appgroup && adduser --system --ingroup appgroup --no-create-home appuser \
    && chown -R appuser:appgroup /var/cache/nginx /var/run /var/log/nginx \
    && sed -i 's|listen\s*80;|listen 8080;|g' /etc/nginx/conf.d/default.conf 2>/dev/null || true

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/lebnani-web/browser /usr/share/nginx/html

RUN chown -R appuser:appgroup /usr/share/nginx/html

USER appuser

EXPOSE 8080