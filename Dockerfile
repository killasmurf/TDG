# Dockerfile (updated to use npm install instead of npm ci)
# -------
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm test
# ------
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app .
CMD ["npm", "start"]
