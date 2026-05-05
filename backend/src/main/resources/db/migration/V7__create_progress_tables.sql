CREATE TABLE xp_event (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    lesson_attempt_id BIGINT REFERENCES lesson_attempt(id),
    amount INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_lesson_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    lesson_id BIGINT NOT NULL REFERENCES lesson(id),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    best_score_percent INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_lesson_progress UNIQUE (user_id, lesson_id)
);