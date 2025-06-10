### Deployment Instructions
## Server Requirements
PHP >= 8.0
MySQL or PostgreSQL
Node.js >= 16
Composer
## Deploy to Server
Upload the project to  server.
Configure the web server (e.g., Apache/Nginx) to point to the public directory.
Set up environment variables in .env (see .env.example).
Run migrations: `php artisan migrate`.
Build frontend assets: `npm run build`.
Environment Variables
Ensure all variables in .env.example are set, especially `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENAI_API_KEY`, and database credentials.