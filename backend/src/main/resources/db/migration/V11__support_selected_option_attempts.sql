ALTER TABLE exercise_attempt
ALTER COLUMN submitted_answer DROP NOT NULL;

ALTER TABLE exercise_attempt
ALTER COLUMN normalized_answer DROP NOT NULL;

ALTER TABLE exercise_attempt
ADD COLUMN selected_option_id BIGINT REFERENCES exercise_option(id);