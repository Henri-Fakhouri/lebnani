package com.henri.lebnani.content;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ContentImportValidatorTest {

    private final ContentImportValidator validator = new ContentImportValidator();

    @Test
    void shouldRejectMultipleChoiceWithoutExactlyOneCorrectOption() {
        ContentImportRequest.OptionImport option1 = option("a", true, 1);
        ContentImportRequest.OptionImport option2 = option("b", true, 2);

        ContentImportRequest.ExerciseImport exercise = exercise(
                "MULTIPLE_CHOICE",
                "Question",
                "a",
                1,
                List.of(option1, option2),
                List.of()
        );

        ContentImportRequest request = requestWithExercise(exercise);

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class)
                .satisfies(exception -> {
                    ContentValidationException validationException = (ContentValidationException) exception;

                    org.assertj.core.api.Assertions.assertThat(validationException.getErrors())
                            .anyMatch(error ->
                                    error.getPath().equals("units[0].lessons[0].exercises[0].options")
                                            && error.getMessage().equals("MULTIPLE_CHOICE exercises must have exactly one correct option.")
                            );
                });
    }

    @Test
    void shouldRejectTypedAnswerWithoutCorrectAnswerOrAcceptedAnswers() {
        ContentImportRequest.ExerciseImport exercise = exercise(
                "TYPE_ANSWER",
                "Question",
                null,
                1,
                List.of(),
                List.of()
        );

        ContentImportRequest request = requestWithExercise(exercise);

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class)
                .satisfies(exception -> {
                    ContentValidationException validationException = (ContentValidationException) exception;

                    org.assertj.core.api.Assertions.assertThat(validationException.getErrors())
                            .anyMatch(error ->
                                    error.getPath().equals("units[0].lessons[0].exercises[0]")
                                            && error.getMessage().equals("TYPE_ANSWER exercises must have correctAnswer or acceptedAnswers.")
                            );
                });
    }

    @Test
    void shouldAcceptValidTypedAnswerExercise() {
        ContentImportRequest.ExerciseImport exercise = exercise(
                "TYPE_ANSWER",
                "Question",
                "mar7aba",
                1,
                List.of(),
                List.of("mar7aba", "marhaba")
        );

        ContentImportRequest request = requestWithExercise(exercise);

        validator.validate(request);
    }

    private ContentImportRequest requestWithExercise(ContentImportRequest.ExerciseImport exercise) {
        ContentImportRequest.LessonImport lesson = new ContentImportRequest.LessonImport();
        set(lesson, "title", "Lesson");
        set(lesson, "description", "Lesson description");
        set(lesson, "displayOrder", 1);
        set(lesson, "exercises", List.of(exercise));

        ContentImportRequest.UnitImport unit = new ContentImportRequest.UnitImport();
        set(unit, "title", "Unit");
        set(unit, "description", "Unit description");
        set(unit, "displayOrder", 1);
        set(unit, "lessons", List.of(lesson));

        ContentImportRequest request = new ContentImportRequest();
        set(request, "units", List.of(unit));

        return request;
    }

    private ContentImportRequest.ExerciseImport exercise(
            String type,
            String promptFr,
            String correctAnswer,
            int displayOrder,
            List<ContentImportRequest.OptionImport> options,
            List<String> acceptedAnswers
    ) {
        ContentImportRequest.ExerciseImport exercise = new ContentImportRequest.ExerciseImport();
        set(exercise, "type", type);
        set(exercise, "promptFr", promptFr);
        set(exercise, "correctAnswer", correctAnswer);
        set(exercise, "displayOrder", displayOrder);
        set(exercise, "options", options);
        set(exercise, "acceptedAnswers", acceptedAnswers);
        return exercise;
    }

    private ContentImportRequest.OptionImport option(String text, boolean correct, int displayOrder) {
        ContentImportRequest.OptionImport option = new ContentImportRequest.OptionImport();
        set(option, "text", text);
        set(option, "correct", correct);
        set(option, "displayOrder", displayOrder);
        return option;
    }

    private void set(Object target, String fieldName, Object value) {
        try {
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception exception) {
            throw new IllegalStateException("Could not set field: " + fieldName, exception);
        }
    }
}