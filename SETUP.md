# Quick Setup Guide

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
CLIENT_URL=http://localhost:3000
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=your-ai-api-key-here
```

## Installation Steps

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

3. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Production Build

1. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Copy build to server:**
   ```bash
   cp -r client/build server/public
   ```

3. **Start production server:**
   ```bash
   cd server
   NODE_ENV=production npm start
   ```

## Docker Deployment

1. **Build and run:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

