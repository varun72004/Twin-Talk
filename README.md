# Twin Talk - Real-time Chat Application

Twin Talk is a full-stack web chat application with real-time messaging, voice typing, image sharing, and an AI assistant. Built with React, Node.js, Express, and Socket.IO.

## Features

- ✅ **Real-time Messaging**: Instant message delivery using Socket.IO
- ✅ **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- ✅ **Voice Typing**: Convert speech to text using Web Speech API
- ✅ **Image Sharing**: Upload and share images in chat
- ✅ **AI Assistant**: Integrated chatbot powered by LLM API (OpenAI compatible)
- ✅ **Multiple Chat Rooms**: Join different rooms for organized conversations
- ✅ **Online Users**: See who's online in real-time
- ✅ **Typing Indicators**: Know when someone is typing
- ✅ **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- ✅ **Accessibility**: ARIA roles, keyboard navigation, and screen reader support
- ✅ **Security**: Input validation, rate limiting, and secure file uploads

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Socket.IO Client
- React Router
- Axios

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT (jsonwebtoken)
- bcryptjs
- Multer (file uploads)
- Express Rate Limit
- Express Validator

## Prerequisites

- Node.js 18+ and npm
- For production: Docker and Docker Compose (optional)

## Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Twin-Talk
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**

   Copy the example environment file and create a `.env` file in the `server` directory:
   ```bash
   cp server/env.example.txt server/.env
   ```
   
   Then edit `server/.env` with your configuration:
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

4. **Start the development servers**

   From the root directory:
   ```bash
   npm run dev
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Production Deployment

### Using Docker Compose (Recommended)

1. **Set environment variables**

   Create a `.env` file in the root directory:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CLIENT_URL=https://your-domain.com
   AI_API_URL=https://api.openai.com/v1/chat/completions
   AI_API_KEY=your-ai-api-key-here
   MAX_FILE_SIZE=5242880
   ```

2. **Build and run**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Application: http://localhost:5000

### Manual Deployment

1. **Build the frontend**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install --production
   ```

3. **Configure environment variables** (see above)

4. **Start the server**
   ```bash
   npm start
   ```

## HTTPS/TLS Configuration

For production deployment with HTTPS:

### Using Nginx as Reverse Proxy

1. **Install Nginx and Certbot**
   ```bash
   sudo apt-get update
   sudo apt-get install nginx certbot python3-certbot-nginx
   ```

2. **Configure Nginx**

   Create `/etc/nginx/sites-available/twin-talk`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable the site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/twin-talk /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Obtain SSL certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

5. **Update environment variables**
   - Set `CLIENT_URL=https://your-domain.com` in your `.env` file
   - Restart the application

### Using Docker with HTTPS

You can use a reverse proxy like Traefik or Caddy in front of your Docker container for automatic HTTPS.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### File Upload
- `POST /api/upload/image` - Upload an image (requires authentication)

### AI Assistant
- `POST /api/ai/chat` - Send message to AI assistant (requires authentication)

### Health Check
- `GET /api/health` - Server health status

## Socket.IO Events

### Client → Server
- `join-room` - Join a chat room
- `leave-room` - Leave a chat room
- `send-message` - Send a message
- `typing` - Send typing indicator

### Server → Client
- `receive-message` - Receive a new message
- `user-online` - User came online
- `user-offline` - User went offline
- `user-typing` - User is typing

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Server-side validation using express-validator
- **File Upload Security**: Type and size validation
- **CORS Configuration**: Restricted to allowed origins
- **Environment Variables**: Sensitive data stored in environment variables

## Accessibility Features

- **ARIA Roles**: Proper semantic HTML and ARIA attributes
- **Keyboard Navigation**: Full keyboard support throughout the app
- **Screen Reader Support**: Alt text and descriptive labels
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG compliant color schemes

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Voice input requires Chrome/Edge (Web Speech API support)

## Multi-Device Support

After deployment, users can access the application from:
- Desktop browsers
- Mobile browsers (responsive design)
- Tablets
- Any device with a modern web browser

All devices connect to the same Socket.IO server, enabling real-time communication across all platforms.

### Multi-Device Configuration

The application is configured to support multiple devices out of the box:

1. **Socket.IO Connection**: Automatically detects the server URL based on the current hostname
2. **CORS Configuration**: Supports multiple origins for cross-device access
3. **Reconnection**: Automatic reconnection with fallback to polling transport for better device compatibility

### Production Deployment for Multi-Device

For production deployment, set `CLIENT_URL` in `server/.env` to include all your domains:
```env
CLIENT_URL=https://yourdomain.com,https://www.yourdomain.com
```

Or use a wildcard pattern by modifying the CORS configuration in `server/index.js` for your specific needs.

## Project Structure

```
Twin-Talk/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context (Auth)
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── middleware/         # Auth, rate limiting
│   ├── models/             # Data models
│   ├── data/               # JSON data storage
│   ├── uploads/            # Uploaded files
│   ├── index.js            # Server entry point
│   └── package.json
├── docker-compose.yml      # Docker Compose config
├── Dockerfile              # Production Dockerfile
└── README.md
```

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change the `PORT` in `server/.env`.

### CORS Errors
Make sure `CLIENT_URL` in `server/.env` matches your frontend URL.

### Socket.IO Connection Issues
- Check that both frontend and backend are running
- Verify the API URL in the frontend matches the backend URL
- Check browser console for connection errors

### Voice Input Not Working
Voice input requires Chrome or Edge browser with Web Speech API support. It may not work in Firefox or Safari.

### AI Assistant Not Responding
- Verify `AI_API_KEY` is set correctly in `server/.env`
- Check that `AI_API_URL` points to a valid OpenAI-compatible API endpoint
- Review server logs for API errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions, please open an issue on the repository.

