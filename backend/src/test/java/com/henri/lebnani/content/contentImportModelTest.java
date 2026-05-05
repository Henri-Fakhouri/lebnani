package com.henri.lebnani.content;

import com.henri.lebnani.course.Course;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ContentImportModelTest {

    @Test
    void contentImportResponse_exposes_all_counts() {
        ContentImportResponse response = new ContentImportResponse(
                10L,
                20L,
                new ContentImportResponse.ImportCounts(1, 2, 3, 4, 5, 6)
        );

        assertThat(response.getImportRunId()).isEqualTo(10L);
        assertThat(response.getCourseId()).isEqualTo(20L);
        assertThat(response.getUnitsCreated()).isEqualTo(1);
        assertThat(response.getLessonsCreated()).isEqualTo(2);
        assertThat(response.getContentBlocksCreated()).isEqualTo(3);
        assertThat(response.getExercisesCreated()).isEqualTo(4);
        assertThat(response.getOptionsCreated()).isEqualTo(5);
        assertThat(response.getAcceptedAnswersCreated()).isEqualTo(6);
    }

    @Test
    void contentImportRun_defaults_to_started_and_exposes_fields() {
        Course course = mock(Course.class);
        User user = mock(User.class);

        ContentImportRun run = new ContentImportRun();
        setId(run, 99L);
        run.setCourse(course);
        run.setUser(user);

        assertThat(run.getId()).isEqualTo(99L);
        assertThat(run.getCourse()).isEqualTo(course);
        assertThat(run.getUser()).isEqualTo(user);
        assertThat(run.getStatus()).isEqualTo(ContentImportRunStatus.STARTED);
        assertThat(run.getUnitsCreated()).isZero();
        assertThat(run.getLessonsCreated()).isZero();
        assertThat(run.getExercisesCreated()).isZero();
        assertThat(run.getOptionsCreated()).isZero();
        assertThat(run.getAcceptedAnswersCreated()).isZero();
        assertThat(run.getErrorMessage()).isNull();
        assertThat(run.getStartedAt()).isNotNull();
        assertThat(run.getCompletedAt()).isNull();
    }

    @Test
    void contentImportRun_markCompleted_sets_status_counts_and_completedAt() {
        ContentImportRun run = new ContentImportRun();

        ContentImportResponse response = new ContentImportResponse(
                10L,
                20L,
                new ContentImportResponse.ImportCounts(1, 2, 3, 4, 5, 6)
        );

        run.markCompleted(response);

        assertThat(run.getStatus()).isEqualTo(ContentImportRunStatus.COMPLETED);
        assertThat(run.getUnitsCreated()).isEqualTo(1);
        assertThat(run.getLessonsCreated()).isEqualTo(2);
        assertThat(run.getExercisesCreated()).isEqualTo(4);
        assertThat(run.getOptionsCreated()).isEqualTo(5);
        assertThat(run.getAcceptedAnswersCreated()).isEqualTo(6);
        assertThat(run.getCompletedAt()).isNotNull();
    }

    @Test
    void contentImportRun_markFailed_sets_status_error_and_completedAt() {
        ContentImportRun run = new ContentImportRun();

        run.markFailed("boom");

        assertThat(run.getStatus()).isEqualTo(ContentImportRunStatus.FAILED);
        assertThat(run.getErrorMessage()).isEqualTo("boom");
        assertThat(run.getCompletedAt()).isNotNull();
    }

    @Test
    void contentImportRunResponse_maps_run() {
        Course course = mock(Course.class);
        when(course.getId()).thenReturn(1L);
        when(course.getTitle()).thenReturn("Lebanese Arabic");

        User user = mock(User.class);
        when(user.getId()).thenReturn(2L);
        when(user.getEmail()).thenReturn("admin@email.com");

        ContentImportRun run = new ContentImportRun();
        setId(run, 3L);
        run.setCourse(course);
        run.setUser(user);
        run.markCompleted(new ContentImportResponse(
                3L,
                1L,
                new ContentImportResponse.ImportCounts(4, 5, 6, 7, 8, 9)
        ));

        ContentImportRunResponse response = new ContentImportRunResponse(run);

        assertThat(response.getId()).isEqualTo(3L);
        assertThat(response.getCourseId()).isEqualTo(1L);
        assertThat(response.getCourseTitle()).isEqualTo("Lebanese Arabic");
        assertThat(response.getUserId()).isEqualTo(2L);
        assertThat(response.getUserEmail()).isEqualTo("admin@email.com");
        assertThat(response.getStatus()).isEqualTo("COMPLETED");
        assertThat(response.getUnitsCreated()).isEqualTo(4);
        assertThat(response.getLessonsCreated()).isEqualTo(5);
        assertThat(response.getExercisesCreated()).isEqualTo(7);
        assertThat(response.getOptionsCreated()).isEqualTo(8);
        assertThat(response.getAcceptedAnswersCreated()).isEqualTo(9);
        assertThat(response.getErrorMessage()).isNull();
        assertThat(response.getStartedAt()).isNotNull();
        assertThat(response.getCompletedAt()).isNotNull();
    }

    @Test
    void contentValidationError_exposes_fields() {
        ContentValidationError error = new ContentValidationError("units[0]", "Bad unit");

        assertThat(error.getPath()).isEqualTo("units[0]");
        assertThat(error.getMessage()).isEqualTo("Bad unit");
    }

    @Test
    void contentValidationException_exposes_errors() {
        ContentValidationError error = new ContentValidationError("path", "message");

        ContentValidationException exception = new ContentValidationException(List.of(error));

        assertThat(exception).hasMessage("Content import validation failed.");
        assertThat(exception.getErrors()).containsExactly(error);
    }

    @Test
    void contentValidationErrorResponse_exposes_fields() {
        ContentValidationError error = new ContentValidationError("path", "message");

        ContentValidationErrorResponse response = new ContentValidationErrorResponse(List.of(error));

        assertThat(response.getCode()).isEqualTo("CONTENT_VALIDATION_ERROR");
        assertThat(response.getMessage()).isEqualTo("Content import validation failed.");
        assertThat(response.getErrors()).containsExactly(error);
        assertThat(response.getTimestamp()).isNotNull();
    }

    @Test
    void contentImportRequest_getters_expose_configured_values() {
        ContentImportRequest.OptionImport option = new ContentImportRequest.OptionImport();
        setField(option, "text", "Ana");
        setField(option, "correct", true);
        setField(option, "displayOrder", 1);

        ContentImportRequest.ExerciseImport exercise = new ContentImportRequest.ExerciseImport();
        setField(exercise, "type", "MULTIPLE_CHOICE");
        setField(exercise, "promptFr", "Choose");
        setField(exercise, "correctAnswer", "Ana");
        setField(exercise, "displayOrder", 2);
        setField(exercise, "options", List.of(option));
        setField(exercise, "acceptedAnswers", List.of("ana"));

        ContentImportRequest.ContentBlockImport block = new ContentImportRequest.ContentBlockImport();
        setField(block, "type", "TEXT");
        setField(block, "content", "Content");
        setField(block, "displayOrder", 3);

        ContentImportRequest.LessonImport lesson = new ContentImportRequest.LessonImport();
        setField(lesson, "title", "Lesson");
        setField(lesson, "description", "Lesson description");
        setField(lesson, "displayOrder", 4);
        setField(lesson, "contentBlocks", List.of(block));
        setField(lesson, "exercises", List.of(exercise));

        ContentImportRequest.UnitImport unit = new ContentImportRequest.UnitImport();
        setField(unit, "title", "Unit");
        setField(unit, "description", "Unit description");
        setField(unit, "displayOrder", 5);
        setField(unit, "lessons", List.of(lesson));

        ContentImportRequest request = new ContentImportRequest();
        setField(request, "units", List.of(unit));

        assertThat(request.getUnits()).containsExactly(unit);

        assertThat(unit.getTitle()).isEqualTo("Unit");
        assertThat(unit.getDescription()).isEqualTo("Unit description");
        assertThat(unit.getDisplayOrder()).isEqualTo(5);
        assertThat(unit.getLessons()).containsExactly(lesson);

        assertThat(lesson.getTitle()).isEqualTo("Lesson");
        assertThat(lesson.getDescription()).isEqualTo("Lesson description");
        assertThat(lesson.getDisplayOrder()).isEqualTo(4);
        assertThat(lesson.getContentBlocks()).containsExactly(block);
        assertThat(lesson.getExercises()).containsExactly(exercise);

        assertThat(block.getType()).isEqualTo("TEXT");
        assertThat(block.getContent()).isEqualTo("Content");
        assertThat(block.getDisplayOrder()).isEqualTo(3);

        assertThat(exercise.getType()).isEqualTo("MULTIPLE_CHOICE");
        assertThat(exercise.getPromptFr()).isEqualTo("Choose");
        assertThat(exercise.getCorrectAnswer()).isEqualTo("Ana");
        assertThat(exercise.getDisplayOrder()).isEqualTo(2);
        assertThat(exercise.getOptions()).containsExactly(option);
        assertThat(exercise.getAcceptedAnswers()).containsExactly("ana");

        assertThat(option.getText()).isEqualTo("Ana");
        assertThat(option.getCorrect()).isTrue();
        assertThat(option.getDisplayOrder()).isEqualTo(1);
    }

    @Test
    void contentImportRequest_null_lists_return_empty_lists_where_supported() {
        ContentImportRequest.LessonImport lesson = new ContentImportRequest.LessonImport();
        setField(lesson, "contentBlocks", null);

        ContentImportRequest.ExerciseImport exercise = new ContentImportRequest.ExerciseImport();
        setField(exercise, "options", null);
        setField(exercise, "acceptedAnswers", null);

        assertThat(lesson.getContentBlocks()).isEmpty();
        assertThat(exercise.getOptions()).isEmpty();
        assertThat(exercise.getAcceptedAnswers()).isEmpty();
    }

    @Test
    void contentImportRunStatus_values_are_available() {
        assertThat(ContentImportRunStatus.valueOf("STARTED")).isEqualTo(ContentImportRunStatus.STARTED);
        assertThat(ContentImportRunStatus.valueOf("COMPLETED")).isEqualTo(ContentImportRunStatus.COMPLETED);
        assertThat(ContentImportRunStatus.valueOf("FAILED")).isEqualTo(ContentImportRunStatus.FAILED);
    }

    private static void setId(Object entity, Long id) {
        setField(entity, "id", id);
    }

    private static void setField(Object entity, String fieldName, Object value) {
        try {
            var field = entity.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(entity, value);
        } catch (Exception exception) {
            throw new RuntimeException(exception);
        }
    }
}