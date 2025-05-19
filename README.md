# MovieMan

## Tech stack:
- Next.js
- NextAuth
- Prisma
- Postgres/Neon
- TMDB API

Create .env file
Fill it like: 
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nextauth #  для локальной бд
NEXTAUTH_SECRET="somesecret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="saasdsf"
GOOGLE_CLIENT_SECRET="dsdsd"
TMDB_API_KEY="fdsfds"


npx prisma migrate dev --name init-name


docker-compose build --no-cache
docker-compose up
or
docker-compose up --build


### Google auth

Credentials -> MovieMan -> edit url from localhost to another ip


/app
/components
/lib
/prisma
/public
/utils
.env
components.json
docker-compose.yml
Dockerfile
eslint.config.mjs
next-env.d.ts
next.config.js
package-lock.json
package.json
postcss.config.mjs
README.md
tsconfig.json

