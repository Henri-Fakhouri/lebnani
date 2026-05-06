CREATE TABLE content_restore_point (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL,
    user_id BIGINT,
    created_at TIMESTAMP NOT NULL,
    reason VARCHAR(80) NOT NULL,
    restored BOOLEAN NOT NULL DEFAULT FALSE,
    restored_at TIMESTAMP,

    CONSTRAINT fk_content_restore_point_course
        FOREIGN KEY (course_id)
        REFERENCES course(id),

    CONSTRAINT fk_content_restore_point_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(id)
);

CREATE TABLE content_restore_unit (
    id BIGSERIAL PRIMARY KEY,
    restore_point_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    original_display_order INTEGER NOT NULL,

    CONSTRAINT fk_content_restore_unit_point
        FOREIGN KEY (restore_point_id)
        REFERENCES content_restore_point(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_content_restore_unit_unit
        FOREIGN KEY (unit_id)
        REFERENCES course_unit(id),

    CONSTRAINT uq_content_restore_unit_point_unit
        UNIQUE (restore_point_id, unit_id)
);

CREATE TABLE content_restore_lesson (
    id BIGSERIAL PRIMARY KEY,
    restore_point_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,

    CONSTRAINT fk_content_restore_lesson_point
        FOREIGN KEY (restore_point_id)
        REFERENCES content_restore_point(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_content_restore_lesson_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lesson(id),

    CONSTRAINT uq_content_restore_lesson_point_lesson
        UNIQUE (restore_point_id, lesson_id)
);