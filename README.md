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
└── README.md
````

---

## Run Full Stack With Docker

Use this mode when you want to run the whole app easily.

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
Angular frontend served by Nginx
```

Open the app:

```text
http://localhost:4200
```

Backend health check:

```text
http://localhost:8080/api/health
```

Swagger:

```text
http://localhost:8080/swagger-ui/index.html
```

Stop everything:

```bash
docker compose down
```

Reset the database completely:

```bash
docker compose down -v
docker compose up --build
```

---

## Environment Variables

Create a local `.env` file:

```bash
cp .env.example .env
```

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

Use this mode when actively coding.

### Backend

Start PostgreSQL only:

```bash
cd ~/dev/lebnani/backend
docker compose up -d postgres
```

Run Spring Boot locally:

```bash
./mvnw spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

### Frontend

In another terminal:

```bash
cd ~/dev/lebnani/frontend/lebnani-web
npm install
npm start
```

Frontend runs on:

```text
http://localhost:4200
```

In local development, Angular uses:

```text
proxy.conf.json
```

to forward `/api` calls to the backend.

---

## Test Account

Create a user:

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

Promote the user to admin:

```bash
docker exec -it lebnani-postgres psql -U lebnani -d lebnani -c "UPDATE app_user SET role = 'ADMIN' WHERE email = 'test@test.com';"
```

Then logout/login again.

---

## Current Features

### Authentication

* Register
* Login
* JWT authentication
* Role-based access:

  * LEARNER
  * CONTENT_EDITOR
  * ADMIN

### Learning

* Browse courses
* Browse units
* Browse lessons
* Start lesson attempts
* Answer exercises
* Multiple-choice exercises
* Typed-answer exercises
* Accepted answer variants
* Complete lessons
* Score calculation
* XP tracking
* Streak tracking
* Course progress tracking

### Review System

* Wrong answers create review items
* Review queue
* Answer review items
* Review items are scheduled or mastered

### Admin

* JSON content import
* Content validation
* Import run tracking
* Admin-only frontend pages
* Admin route protection

### Frontend

* Login page
* Register page
* Course dashboard
* Lesson player
* Lesson result screen
* Review queue page
* Admin JSON import page
* Admin import history page
* Route guards
* JWT HTTP interceptor
* Auth error handling

---

## Backend Commands

Run tests:

```bash
cd ~/dev/lebnani/backend
./mvnw test
```

Build backend Docker image:

```bash
cd ~/dev/lebnani/backend
docker build -t lebnani-api .
```

Run backend Docker Compose only:

```bash
cd ~/dev/lebnani/backend
docker compose up --build
```

---

## Frontend Commands

Run frontend locally:

```bash
cd ~/dev/lebnani/frontend/lebnani-web
npm start
```

Build frontend:

```bash
npm run build
```

Build frontend Docker image:

```bash
docker build -t lebnani-web .
```

---

## Content Import Example

Go to:

```text
http://localhost:4200/admin/import
```

Paste JSON like:

```json
{
  "units": [
    {
      "title": "Voyage",
      "description": "Expressions utiles pour voyager.",
      "displayOrder": 100,
      "lessons": [
        {
          "title": "À l'aéroport",
          "description": "Premières phrases pour voyager.",
          "displayOrder": 1,
          "exercises": [
            {
              "type": "TYPE_ANSWER",
              "promptFr": "Écris \"je veux aller\" en libanais.",
              "correctAnswer": "baddi rou7",
              "displayOrder": 1,
              "acceptedAnswers": [
                "baddi rou7",
                "badde rouh",
                "bade rou7"
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## GitHub Actions CI

The project has a CI workflow that runs on push and pull request.

It checks:

```text
Backend tests
Frontend build
```

Workflow file:

```text
.github/workflows/ci.yml
```

---

## Main Backend Concepts Used

* Controller
* Service
* Repository
* Entity
* DTO
* Validation
* JWT
* Spring Security
* Flyway migrations
* PostgreSQL persistence
* Dockerized database

---

## Main Frontend Concepts Used

* Angular standalone components
* Routing
* Route guards
* Services
* HTTP client
* JWT interceptor
* Local storage session
* Template control flow
* Basic responsive UI

---

## Roadmap

* Add more real Lebanese Arabic content
* Add lesson explanations
* Improve answer feedback further
* Add more backend tests
* Add more frontend tests
* Improve UI polish
* Prepare production deployment
* Add real production secrets
* Add HTTPS/domain deployment
* Add audio later

