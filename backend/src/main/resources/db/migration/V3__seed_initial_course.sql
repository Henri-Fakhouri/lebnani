INSERT INTO course (code, title, description, source_language, target_language, published)
VALUES (
    'lebanese-arabic-fr',
    'Libanais parlé pour francophones',
    'Cours débutant pour apprendre les bases du libanais parlé.',
    'fr',
    'leb',
    true
);

INSERT INTO course_unit (course_id, title, description, display_order, published)
SELECT id, 'Salutations', 'Dire bonjour, demander comment ça va, répondre simplement.', 1, true
FROM course
WHERE code = 'lebanese-arabic-fr';

INSERT INTO course_unit (course_id, title, description, display_order, published)
SELECT id, 'Présentations', 'Se présenter, donner son prénom, demander le prénom de quelqu’un.', 2, true
FROM course
WHERE code = 'lebanese-arabic-fr';

INSERT INTO lesson (unit_id, title, description, display_order, published)
SELECT id, 'Bonjour et salut', 'Premiers mots utiles : mar7aba, ahlan, kifak.', 1, true
FROM course_unit
WHERE title = 'Salutations';

INSERT INTO lesson (unit_id, title, description, display_order, published)
SELECT id, 'Comment ça va ?', 'Comprendre et répondre à kifak/kifik.', 2, true
FROM course_unit
WHERE title = 'Salutations';

INSERT INTO lesson (unit_id, title, description, display_order, published)
SELECT id, 'Je m’appelle...', 'Dire son prénom simplement.', 1, true
FROM course_unit
WHERE title = 'Présentations';