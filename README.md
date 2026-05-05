# Lebnani

Lebnani is a full-stack web app for learning spoken Lebanese Arabic, starting with French-speaking learners.

The project includes:

- Java 21
- Spring Boot
- PostgreSQL
- Flyway
- JWT authentication
- Angular
- Docker Compose
- Swagger/OpenAPI
- GitHub Actions CI

---

## Project Structure

```text
lebnani/
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/
│   └── lebnani-web/
│       ├── src/
│       ├── Dockerfile
│       └── nginx.conf
├── docker-compose.yml
├── .env.example
├── .env.production.example
└── README.md
````

---

## Run Full Stack With Docker

From the repository root:

```bash
cd ~/dev/lebnani
cp .env.example .env
docker compose up --build
```

This starts:

```text
PostgreSQL
Spring Boot backend
Angular frontend (served by Nginx)
```

Open:

```text
http://localhost:4200
```

Backend health:

```text
http://localhost:8080/api/health
```

Swagger:

```text
http://localhost:8080/swagger-ui/index.html
```

Stop:

```bash
docker compose down
```

Reset DB:

```bash
docker compose down -v
docker compose up --build
```

---

## Environment Variables

Create local config:

```bash
cp .env.example .env
```

For production-like setup:

```bash
cp .env.production.example .env
```

Then replace all placeholder values with real secure values.

Never use the default development secrets in production.

Example:

```env
POSTGRES_DB=lebnani
POSTGRES_USER=lebnani
POSTGRES_PASSWORD=lebnani

APP_JWT_SECRET=CHANGE_THIS_SECRET_CHANGE_THIS_SECRET_CHANGE_THIS_SECRET_123456
APP_JWT_EXPIRATION_MINUTES=60
```

Do not commit `.env`.

---

## Local Development Mode

### Backend

```bash
cd ~/dev/lebnani/backend
docker compose up -d postgres
./mvnw spring-boot:run
```

Backend:

```text
http://localhost:8080
```

### Frontend

```bash
cd ~/dev/lebnani/frontend/lebnani-web
npm install
npm start
```

Frontend:

```text
http://localhost:4200
```

Angular uses `proxy.conf.json` to forward `/api`.

---

## Test Account

Create:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","displayName":"Henri"}'
```

Login:

```text
test@test.com
123456
```

Promote to admin:

```bash
docker exec -it lebnani-postgres psql -U lebnani -d lebnani -c "UPDATE app_user SET role = 'ADMIN' WHERE email = 'test@test.com';"
```

---

## Features

### Authentication

* Register / Login
* JWT authentication
* Roles: LEARNER / CONTENT_EDITOR / ADMIN

### Learning

* Courses → Units → Lessons
* Multiple-choice + typed answers
* Accepted answer variants
* Score calculation
* XP system
* Streak system
* Progress tracking

### Review System

* Wrong answers create review items
* Review queue
* Spaced repetition logic

### Admin

* JSON content import
* Validation
* Import history UI

### Frontend

* Dashboard
* Lesson player
* Review page
* Admin pages
* Route guards
* JWT interceptor

---

## Backend Commands

```bash
cd backend
./mvnw test
docker build -t lebnani-api .
docker compose up --build
```

---

## Frontend Commands

```bash
cd frontend/lebnani-web
npm start
npm run build
docker build -t lebnani-web .
```

---

## Content Import

Go to:

```text
http://localhost:4200/admin/import
```

Paste JSON:

```json
{
  "units": [
    {
      "title": "Voyage",
      "description": "Expressions utiles.",
      "displayOrder": 100,
      "lessons": [
        {
          "title": "Aéroport",
          "description": "Bases",
          "displayOrder": 1,
          "exercises": [
            {
              "type": "TYPE_ANSWER",
              "promptFr": "Écris \"je veux aller\"",
              "correctAnswer": "baddi rou7",
              "displayOrder": 1,
              "acceptedAnswers": ["baddi rou7", "badde rouh"]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## CI

GitHub Actions:

```text
.github/workflows/ci.yml
```

Runs:

```text
Backend tests
Frontend build
```

---

## Tech Concepts

### Backend

* Spring Boot
* REST API
* JPA / Hibernate
* Flyway
* JWT
* Validation
* Docker

### Frontend

* Angular standalone components
* Routing
* Services
* HTTP client
* Interceptors
* State via services

---

## Roadmap

* More content
* Better UX
* More tests
* Deployment
* HTTPS
* Audio features

````

---



