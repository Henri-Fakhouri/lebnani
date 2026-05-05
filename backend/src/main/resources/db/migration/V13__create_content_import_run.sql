CREATE TABLE content_import_run (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(id),
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    status VARCHAR(50) NOT NULL,
    units_created INTEGER NOT NULL DEFAULT 0,
    lessons_created INTEGER NOT NULL DEFAULT 0,
    exercises_created INTEGER NOT NULL DEFAULT 0,
    options_created INTEGER NOT NULL DEFAULT 0,
    accepted_answers_created INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);