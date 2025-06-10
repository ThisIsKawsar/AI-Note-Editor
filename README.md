# Setup Instructions

## 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-Note-Editor\
```
## 2. Install Dependencies
```bash
composer install
npm install
```

## 3. Environment Configuration
```bash
APP_NAME=AiNoteEditor
APP_ENV=local
APP_KEY=generate-with-artisan-key
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_note_editor
DB_USERNAME=root
DB_PASSWORD=

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost/auth/google/callback

OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
Generate the application key:
```bash
php artisan migrate
```
## 4. Database Setup
```bash
php artisan migrate
```

## 5. Build Frontend
```bash
npm run dev
```

## 6. Run the Application
```bash
php artisan serve
```

## 7. Access the Application
```bash
http://localhost:8000
```