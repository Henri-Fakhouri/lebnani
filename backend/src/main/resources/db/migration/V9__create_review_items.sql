CREATE TABLE review_item (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    exercise_id BIGINT NOT NULL REFERENCES exercise(id),
    source_exercise_attempt_id BIGINT REFERENCES exercise_attempt(id),
    status VARCHAR(50) NOT NULL,
    failure_count INTEGER NOT NULL DEFAULT 1,
    success_count INTEGER NOT NULL DEFAULT 0,
    next_review_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_review_item_user_exercise UNIQUE (user_id, exercise_id)
);