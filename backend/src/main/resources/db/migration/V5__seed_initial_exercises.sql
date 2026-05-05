INSERT INTO exercise (lesson_id, type, prompt_fr, correct_answer, display_order, published)
SELECT id, 'MULTIPLE_CHOICE', 'Que veut dire "mar7aba" ?', 'bonjour', 1, true
FROM lesson
WHERE title = 'Bonjour et salut';

INSERT INTO exercise_option (exercise_id, text_value, correct, display_order)
SELECT id, 'bonjour', true, 1
FROM exercise
WHERE prompt_fr = 'Que veut dire "mar7aba" ?';

INSERT INTO exercise_option (exercise_id, text_value, correct, display_order)
SELECT id, 'merci', false, 2
FROM exercise
WHERE prompt_fr = 'Que veut dire "mar7aba" ?';

INSERT INTO exercise_option (exercise_id, text_value, correct, display_order)
SELECT id, 'au revoir', false, 3
FROM exercise
WHERE prompt_fr = 'Que veut dire "mar7aba" ?';

INSERT INTO exercise (lesson_id, type, prompt_fr, correct_answer, display_order, published)
SELECT id, 'TYPE_ANSWER', 'Écris "bonjour" en libanais.', 'mar7aba', 2, true
FROM lesson
WHERE title = 'Bonjour et salut';

INSERT INTO exercise (lesson_id, type, prompt_fr, correct_answer, display_order, published)
SELECT id, 'MULTIPLE_CHOICE', 'Que veut dire "kifak" ?', 'comment ça va ?', 3, true
FROM lesson
WHERE title = 'Bonjour et salut';

INSERT INTO exercise_option (exercise_id, text_value, correct, display_order)
SELECT id, 'comment ça va ?', true, 1
FROM exercise
WHERE prompt_fr = 'Que veut dire "kifak" ?';

INSERT INTO exercise_option (exercise_id, text_value, correct, display_order)
SELECT id, 'je veux', false, 2
FROM exercise
WHERE prompt_fr = 'Que veut dire "kifak" ?';

INSERT INTO exercise_option (exercise_id, text_value, correct, display_order)
SELECT id, 'bonne nuit', false, 3
FROM exercise
WHERE prompt_fr = 'Que veut dire "kifak" ?';