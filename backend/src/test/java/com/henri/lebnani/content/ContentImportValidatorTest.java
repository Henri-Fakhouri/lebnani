package com.henri.lebnani.content;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ContentImportValidatorTest {

    private final ContentImportValidator validator = new ContentImportValidator();

    @Test
    void empty_units_passes_validator_layer() {
        ContentImportRequest request = buildRequest(List.of());

        assertThatCode(() -> validator.validate(request)).doesNotThrowAnyException();
    }

    @Test
    void valid_type_answer_with_correct_answer_passes() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildTypeAnswerExercise(1, "baddi rou7", List.of())
                        ))
                ))
        ));

        assertThatCode(() -> validator.validate(request)).doesNotThrowAnyException();
    }

    @Test
    void valid_type_answer_with_accepted_answers_passes() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildTypeAnswerExercise(1, null, List.of("baddi rou7"))
                        ))
                ))
        ));

        assertThatCode(() -> validator.validate(request)).doesNotThrowAnyException();
    }

    @Test
    void valid_type_answer_with_blank_correct_answer_and_accepted_answers_passes() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildTypeAnswerExercise(1, "   ", List.of("baddi rou7"))
                        ))
                ))
        ));

        assertThatCode(() -> validator.validate(request)).doesNotThrowAnyException();
    }

    @Test
    void valid_multiple_choice_exercise_passes() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildMultipleChoiceExercise(1, List.of(
                                        buildOption(1, true),
                                        buildOption(2, false)
                                ))
                        ))
                ))
        ));

        assertThatCode(() -> validator.validate(request)).doesNotThrowAnyException();
    }

    @Test
    void valid_multiple_choice_with_lowercase_and_spaces_type_passes() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildExercise(1, "  multiple_choice  ", null, List.of(
                                        buildOption(1, true),
                                        buildOption(2, false)
                                ))
                        ))
                ))
        ));

        assertThatCode(() -> validator.validate(request)).doesNotThrowAnyException();
    }

    @Test
    void null_display_orders_do_not_create_duplicate_errors() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(null, List.of(
                        buildLesson(null, List.of(
                                buildMultipleChoiceExercise(null, List.of(
                                        buildOption(null, true),
                                        buildOption(null, false)
                                ))
                        ))
                ))
        ));

        assertThatCode(() -> validator.validate(request)).doesNotThrowAnyException();
    }

    @Test
    void duplicate_unit_display_orders_throw() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of()),
                buildUnit(1, List.of())
        ));

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class)
                .satisfies(exception -> {
                    ContentValidationException validationException = (ContentValidationException) exception;
                    org.assertj.core.api.Assertions.assertThat(validationException.getErrors())
                            .extracting(ContentValidationError::getPath)
                            .contains("units");
                });
    }

    @Test
    void duplicate_lesson_display_orders_throw() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of()),
                        buildLesson(1, List.of())
                ))
        ));

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class);
    }

    @Test
    void duplicate_exercise_display_orders_throw() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildTypeAnswerExercise(1, "answer", List.of()),
                                buildTypeAnswerExercise(1, "answer2", List.of())
                        ))
                ))
        ));

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class);
    }

    @Test
    void duplicate_option_display_orders_throw() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildMultipleChoiceExercise(1, List.of(
                                        buildOption(1, true),
                                        buildOption(1, false)
                                ))
                        ))
                ))
        ));

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class);
    }

    @Test
    void multiple_choice_with_no_options_throws() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildMultipleChoiceExercise(1, List.of())
                        ))
                ))
        ));

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class);
    }

    @Test
    void multiple_choice_with_no_correct_option_throws() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildMultipleChoiceExercise(1, List.of(
                                        buildOption(1, false),
                                        buildOption(2, false)
                                ))
                        ))
                ))
        ));

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class);
    }

    @Test
    void multiple_choice_with_multiple_correct_options_throws() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildMultipleChoiceExercise(1, List.of(
                                        buildOption(1, true),
                                        buildOption(2, true)
                                ))
                        ))
                ))
        ));

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class);
    }

    @Test
    void type_answer_with_no_correct_answer_throws() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildTypeAnswerExercise(1, null, List.of())
                        ))
                ))
        ));

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class);
    }

    @Test
    void unsupported_exercise_type_throws() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildExercise(1, "UNSUPPORTED", null, List.of())
                        ))
                ))
        ));

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class);
    }

    @Test
    void null_exercise_type_throws() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildExercise(1, null, null, List.of())
                        ))
                ))
        ));

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class);
    }

    private ContentImportRequest buildRequest(List<ContentImportRequest.UnitImport> units) {
        ContentImportRequest request = mock(ContentImportRequest.class);
        when(request.getUnits()).thenReturn(units);
        return request;
    }

    private ContentImportRequest.UnitImport buildUnit(
            Integer order,
            List<ContentImportRequest.LessonImport> lessons
    ) {
        ContentImportRequest.UnitImport unit = mock(ContentImportRequest.UnitImport.class);
        when(unit.getDisplayOrder()).thenReturn(order);
        when(unit.getLessons()).thenReturn(lessons);
        return unit;
    }

    private ContentImportRequest.LessonImport buildLesson(
            Integer order,
            List<ContentImportRequest.ExerciseImport> exercises
    ) {
        ContentImportRequest.LessonImport lesson = mock(ContentImportRequest.LessonImport.class);
        when(lesson.getDisplayOrder()).thenReturn(order);
        when(lesson.getExercises()).thenReturn(exercises);
        return lesson;
    }

    private ContentImportRequest.ExerciseImport buildTypeAnswerExercise(
            Integer order,
            String correctAnswer,
            List<String> acceptedAnswers
    ) {
        return buildExercise(order, "TYPE_ANSWER", correctAnswer, List.of(), acceptedAnswers);
    }

    private ContentImportRequest.ExerciseImport buildMultipleChoiceExercise(
            Integer order,
            List<ContentImportRequest.OptionImport> options
    ) {
        return buildExercise(order, "MULTIPLE_CHOICE", null, options, List.of());
    }

    private ContentImportRequest.ExerciseImport buildExercise(
            Integer order,
            String type,
            String correctAnswer,
            List<ContentImportRequest.OptionImport> options
    ) {
        return buildExercise(order, type, correctAnswer, options, List.of());
    }

    private ContentImportRequest.ExerciseImport buildExercise(
            Integer order,
            String type,
            String correctAnswer,
            List<ContentImportRequest.OptionImport> options,
            List<String> acceptedAnswers
    ) {
        ContentImportRequest.ExerciseImport exercise = mock(ContentImportRequest.ExerciseImport.class);
        when(exercise.getDisplayOrder()).thenReturn(order);
        when(exercise.getType()).thenReturn(type);
        when(exercise.getCorrectAnswer()).thenReturn(correctAnswer);
        when(exercise.getAcceptedAnswers()).thenReturn(acceptedAnswers);
        when(exercise.getOptions()).thenReturn(options);
        return exercise;
    }

    private ContentImportRequest.OptionImport buildOption(Integer order, boolean correct) {
        ContentImportRequest.OptionImport option = mock(ContentImportRequest.OptionImport.class);
        when(option.getDisplayOrder()).thenReturn(order);
        when(option.getCorrect()).thenReturn(correct);
        return option;
    }
}