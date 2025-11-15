# Multi-stage build for production
FROM node:18-alpine AS builder

# Build frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY server/package*.json ./
RUN npm install --production

# Copy server source
COPY server/ ./

# Copy built frontend
COPY --from=builder /app/client/build ./public

# Create uploads directory
RUN mkdir -p uploads data

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "index.js"]

