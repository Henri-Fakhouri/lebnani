CREATE TABLE exercise (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lesson(id),
    type VARCHAR(50) NOT NULL,
    prompt_fr TEXT NOT NULL,
    correct_answer TEXT,
    display_order INTEGER NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_exercise_order UNIQUE (lesson_id, display_order)
);

CREATE TABLE exercise_option (
    id BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT NOT NULL REFERENCES exercise(id),
    text_value TEXT NOT NULL,
    correct BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL,
    CONSTRAINT uq_exercise_option_order UNIQUE (exercise_id, display_order)
);