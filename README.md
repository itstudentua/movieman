# 🎬 MovieMan

> Personal movie & TV show library with TMDb integration, built with Next.js, Prisma, and PostgreSQL.

---

MovieMan is a web application for movie and TV series lovers who want to organize their watch history, create personal lists, add reviews, ratings, and plan future viewings. The app integrates with the **TMDb API** to fetch up-to-date details about titles and offers features to track and personalize your collection.

---

## 👤 Target Audience

- Movie & TV enthusiasts who want to track watched content.
- Users looking to plan and organize what to watch next.
- Those who enjoy sharing opinions and collections with friends.

---

## ✨ Features

### 🔎 Movie & TV Search
- Integration with **TMDb API** to search by title, cast, crew, genres, etc.
- Display of detailed information (overview, rating, cast, director, poster, etc.).

### 🧑‍💼 User Accounts
- Secure sign-up and sign-in using **NextAuth.js** (email & Google).
- Personalized dashboard and saved user data.

### 📚 Lists & Collections
- **Watched**: mark titles as watched, add viewing dates and ratings.
- **Watch Later**: save movies/series for future viewing.
- Create and manage **custom lists**, and share them via link.

### ✍️ Personalization
- Add personal reviews/notes to any movie or show.
- Rate titles from your own perspective.
- View your movie history and customize your library.

### 💡 Optional Features (Planned)
- Smart recommendations based on your history.
- Public or private lists with shareable links.
- Curated collections based on custom filters.

---

## 🛠 Technologies Used

- **Frontend**: [Next.js 13+ App Router](https://nextjs.org/)
- **Backend**: [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/) with Google OAuth
- **API**: [TMDb API](https://www.themoviedb.org/documentation/api)
- **DevOps**: Docker + Docker Compose
- **Deployment**: Vercel + Neon.tech (Postgres hosting)

---

## 📦 Installation & Setup

### 1. Get a TMDb API Key

👉 Create an account on [TMDb](https://www.themoviedb.org/)  
👉 Go to [API Settings](https://www.themoviedb.org/settings/api)  
👉 Create a developer key and whitelist:
http://localhost:3000
https://your-deployed-app.vercel.app

### 2. 🔐 Google Auth Setup

- Go to Google Cloud Console
- Create OAuth2 credentials
- Add `http://localhost:3000` and `https://your-vercel-app.vercel.app` to "Authorized redirect URIs"

---

### 3. Create `.env` file

```env
# Database (Neon or local Postgres)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Auth
NEXTAUTH_SECRET=your_super_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# TMDb
TMDB_API_KEY=your_tmdb_api_key
```

### 4. Run Migrations
`npx prisma migrate dev --name init`

### 5. Docker (optional but recommended)
`docker-compose build --no-cache`
`docker-compose up`

`docker-compose up --build`

### 6. Start project
#### 📍 Local:
Make sure your database is running (e.g., PostgreSQL).
Install dependencies:
`npm install`
Start the development server:
`npm run dev`

#### 🐳 Docker:
Build and start the containers:
- `docker-compose up --build`


## 🌍 Deployment on Vercel

Ensure the following environment variables are set in your Vercel dashboard:

- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL → `https://your-app-name.vercel.app`
- GOOGLE_CLIENT_ID 
- GOOGLE_CLIENT_SECRET
- TMDB_API_KEY