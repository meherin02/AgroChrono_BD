FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY backend/src ./backend/src
COPY shared ./shared
ENV HOST=0.0.0.0
EXPOSE 5000
CMD ["node", "backend/src/server.js"]
