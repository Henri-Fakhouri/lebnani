# Lebnani

Lebnani is a web app for learning spoken Lebanese Arabic, starting with French-speaking learners.

The project is built as a full-stack learning platform with:

- Java 21
- Spring Boot
- PostgreSQL
- Flyway
- JWT authentication
- Angular
- Docker Compose
- Swagger/OpenAPI

---

## Current Features

### Authentication

- Register
- Login
- JWT authentication
- Role-based access:
  - LEARNER
  - CONTENT_EDITOR
  - ADMIN

### Learning

- Browse courses
- Browse units
- Browse lessons
- Start a lesson attempt
- Answer exercises
- Multiple-choice exercises
- Typed-answer exercises
- Accepted answer variants
- Complete lessons
- Score calculation
- XP tracking
- Streak tracking
- Course progress tracking

### Review System

- Wrong answers create review items
- Review queue
- Answer review items
- Review items are scheduled or mastered

### Admin

- JSON content import
- Content validation
- Import run tracking
- Admin-only frontend page

### Frontend

- Login page
- Register page
- Course dashboard
- Lesson player
- Lesson result screen
- Review queue page
- Admin JSON import page
- Route guards
- JWT HTTP interceptor

---

## Project Structure

```text
lebnani/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── docker-compose.yml
├── frontend/
│   └── lebnani-web/
└── README.md
````

---

## Requirements

Install:

* Java 21
* Maven wrapper is included
* Docker
* Docker Compose
* Node.js
* npm

Check:

```bash
java -version
docker --version
docker compose version
node -v
npm -v
```

---

## Run Backend

Start PostgreSQL:

```bash
cd backend
docker compose up -d
```

Run Spring Boot:

```bash
./mvnw spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

Health check:

```text
http://localhost:8080/api/health
```

Swagger:

```text
http://localhost:8080/swagger-ui/index.html
```

---

## Run Frontend

```bash
cd frontend/lebnani-web
npm install
npm start
```

Frontend runs on:

```text
http://localhost:4200
```

---

## Test Account

If needed, create a user:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","displayName":"Henri"}'
```

Promote user to admin:

```bash
docker exec -it lebnani-postgres psql -U lebnani -d lebnani -c "UPDATE app_user SET role = 'ADMIN' WHERE email = 'test@test.com';"
```

Login:

```text
test@test.com
123456
```

---

## Useful Backend Commands

Run tests:

```bash
cd backend
./mvnw test
```

Reset database:

```bash
cd backend
docker compose down -v
docker compose up -d
./mvnw spring-boot:run
```

View running containers:

```bash
docker ps
```

---

## Useful Frontend Commands

Run frontend:

```bash
cd frontend/lebnani-web
npm start
```

Build frontend:

```bash
npm run build
```

---

## Example Content Import

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

## Next Roadmap

* Add more real Lebanese Arabic content
* Add lesson explanations
* Improve answer feedback
* Add admin import history UI
* Add tests
* Add GitHub Actions CI
* Add Dockerfile
* Improve UI polish
* Add audio later


