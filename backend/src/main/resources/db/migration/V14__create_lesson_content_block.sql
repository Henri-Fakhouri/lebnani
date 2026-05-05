CREATE TABLE lesson_content_block (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lesson(id),
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lesson_content_block_order UNIQUE (lesson_id, display_order)
);