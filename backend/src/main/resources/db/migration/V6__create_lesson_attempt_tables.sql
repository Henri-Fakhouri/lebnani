CREATE TABLE lesson_attempt (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    lesson_id BIGINT NOT NULL REFERENCES lesson(id),
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE exercise_attempt (
    id BIGSERIAL PRIMARY KEY,
    lesson_attempt_id BIGINT NOT NULL REFERENCES lesson_attempt(id),
    exercise_id BIGINT NOT NULL REFERENCES exercise(id),
    submitted_answer TEXT NOT NULL,
    normalized_answer TEXT NOT NULL,
    correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);