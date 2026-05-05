CREATE TABLE exercise_accepted_answer (
    id BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT NOT NULL REFERENCES exercise(id),
    answer_text TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    CONSTRAINT uq_exercise_accepted_answer UNIQUE (exercise_id, answer_text)
);

INSERT INTO exercise_accepted_answer (exercise_id, answer_text, display_order)
SELECT id, 'mar7aba', 1
FROM exercise
WHERE prompt_fr = 'Écris "bonjour" en libanais.';

INSERT INTO exercise_accepted_answer (exercise_id, answer_text, display_order)
SELECT id, 'marhaba', 2
FROM exercise
WHERE prompt_fr = 'Écris "bonjour" en libanais.';

INSERT INTO exercise_accepted_answer (exercise_id, answer_text, display_order)
SELECT id, 'marhaban', 3
FROM exercise
WHERE prompt_fr = 'Écris "bonjour" en libanais.';