package com.henri.lebnani.content;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ContentImportValidatorTest {

    private final ContentImportValidator validator = new ContentImportValidator();

    // ── valid requests ───────────────────────────────────────────────────────

    @Test
    void valid_type_answer_exercise_passes() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(
                                buildTypeAnswerExercise(1, "baddi rou7", List.of("baddi rou7"))
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

    // ── duplicate order errors ───────────────────────────────────────────────

    @Test
    void duplicate_unit_display_orders_throw() {
        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of()),
                buildUnit(1, List.of())
        ));

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class);
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
                                buildTypeAnswerExercise(1, "answer", List.of("answer")),
                                buildTypeAnswerExercise(1, "answer2", List.of("answer2"))
                        ))
                ))
        ));

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class);
    }

    // ── multiple choice errors ───────────────────────────────────────────────

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

    // ── type answer errors ───────────────────────────────────────────────────

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
        ContentImportRequest.ExerciseImport ex = mock(ContentImportRequest.ExerciseImport.class);
        when(ex.getType()).thenReturn("UNSUPPORTED");
        when(ex.getDisplayOrder()).thenReturn(1);

        ContentImportRequest request = buildRequest(List.of(
                buildUnit(1, List.of(
                        buildLesson(1, List.of(ex))
                ))
        ));

        assertThatThrownBy(() -> validator.validate(request))
                .isInstanceOf(ContentValidationException.class);
    }

    // ── builders ─────────────────────────────────────────────────────────────

    private ContentImportRequest buildRequest(List<ContentImportRequest.UnitImport> units) {
        ContentImportRequest r = mock(ContentImportRequest.class);
        when(r.getUnits()).thenReturn(units);
        return r;
    }

    private ContentImportRequest.UnitImport buildUnit(int order, List<ContentImportRequest.LessonImport> lessons) {
        ContentImportRequest.UnitImport u = mock(ContentImportRequest.UnitImport.class);
        when(u.getDisplayOrder()).thenReturn(order);
        when(u.getLessons()).thenReturn(lessons);
        return u;
    }

    private ContentImportRequest.LessonImport buildLesson(int order, List<ContentImportRequest.ExerciseImport> exercises) {
        ContentImportRequest.LessonImport l = mock(ContentImportRequest.LessonImport.class);
        when(l.getDisplayOrder()).thenReturn(order);
        when(l.getExercises()).thenReturn(exercises);
        return l;
    }

    private ContentImportRequest.ExerciseImport buildTypeAnswerExercise(int order, String correctAnswer, List<String> acceptedAnswers) {
        ContentImportRequest.ExerciseImport ex = mock(ContentImportRequest.ExerciseImport.class);
        when(ex.getDisplayOrder()).thenReturn(order);
        when(ex.getType()).thenReturn("TYPE_ANSWER");
        when(ex.getCorrectAnswer()).thenReturn(correctAnswer);
        when(ex.getAcceptedAnswers()).thenReturn(acceptedAnswers);
        when(ex.getOptions()).thenReturn(List.of());
        return ex;
    }

    private ContentImportRequest.ExerciseImport buildMultipleChoiceExercise(int order, List<ContentImportRequest.OptionImport> options) {
        ContentImportRequest.ExerciseImport ex = mock(ContentImportRequest.ExerciseImport.class);
        when(ex.getDisplayOrder()).thenReturn(order);
        when(ex.getType()).thenReturn("MULTIPLE_CHOICE");
        when(ex.getOptions()).thenReturn(options);
        return ex;
    }

    private ContentImportRequest.OptionImport buildOption(int order, boolean correct) {
        ContentImportRequest.OptionImport opt = mock(ContentImportRequest.OptionImport.class);
        when(opt.getDisplayOrder()).thenReturn(order);
        when(opt.getCorrect()).thenReturn(correct);
        return opt;
    }
}