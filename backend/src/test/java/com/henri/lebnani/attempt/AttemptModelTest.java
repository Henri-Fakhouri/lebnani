package com.henri.lebnani.attempt;

import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AttemptModelTest {

    @Test
    void answerSubmissionRequest_exposes_fields() {
        AnswerSubmissionRequest request = new AnswerSubmissionRequest();
        setField(request, "exerciseId", 1L);
        setField(request, "answer", "baddi rou7");
        setField(request, "selectedOptionId", 2L);

        assertThat(request.getExerciseId()).isEqualTo(1L);
        assertThat(request.getAnswer()).isEqualTo("baddi rou7");
        assertThat(request.getSelectedOptionId()).isEqualTo(2L);
    }

    @Test
    void answerSubmissionResponse_exposes_fields() {
        AnswerSubmissionResponse response = new AnswerSubmissionResponse(
                1L,
                2L,
                "Baddi Rou7",
                "baddi rou7",
                3L,
                true,
                "baddi rou7"
        );

        assertThat(response.getExerciseAttemptId()).isEqualTo(1L);
        assertThat(response.getExerciseId()).isEqualTo(2L);
        assertThat(response.getSubmittedAnswer()).isEqualTo("Baddi Rou7");
        assertThat(response.getNormalizedAnswer()).isEqualTo("baddi rou7");
        assertThat(response.getSelectedOptionId()).isEqualTo(3L);
        assertThat(response.isCorrect()).isTrue();
        assertThat(response.getExpectedAnswer()).isEqualTo("baddi rou7");
    }

    @Test
    void completeLessonAttemptResponse_exposes_fields_and_calculates_score() {
        CompleteLessonAttemptResponse response = new CompleteLessonAttemptResponse(
                1L,
                2L,
                "COMPLETED",
                3L,
                3L,
                2L,
                7
        );

        assertThat(response.getAttemptId()).isEqualTo(1L);
        assertThat(response.getLessonId()).isEqualTo(2L);
        assertThat(response.getStatus()).isEqualTo("COMPLETED");
        assertThat(response.getTotalExercises()).isEqualTo(3L);
        assertThat(response.getAnsweredExercises()).isEqualTo(3L);
        assertThat(response.getCorrectAnswers()).isEqualTo(2L);
        assertThat(response.getWrongAnswers()).isEqualTo(1L);
        assertThat(response.getScorePercent()).isEqualTo(67);
        assertThat(response.getXpAwarded()).isEqualTo(7);
    }

    @Test
    void completeLessonAttemptResponse_zero_total_exercises_has_zero_score() {
        CompleteLessonAttemptResponse response = new CompleteLessonAttemptResponse(
                1L,
                2L,
                "COMPLETED",
                0L,
                0L,
                0L,
                0
        );

        assertThat(response.getScorePercent()).isZero();
        assertThat(response.getWrongAnswers()).isZero();
    }

    @Test
    void exerciseAttempt_getters_and_setters_work() {
        LessonAttempt lessonAttempt = new LessonAttempt();
        Exercise exercise = new Exercise();

        ExerciseAttempt attempt = new ExerciseAttempt();
        setId(attempt, 1L);

        attempt.setLessonAttempt(lessonAttempt);
        attempt.setExercise(exercise);
        attempt.setSubmittedAnswer("Baddi Rou7");
        attempt.setNormalizedAnswer("baddi rou7");
        attempt.setSelectedOptionId(2L);
        attempt.setCorrect(true);

        assertThat(attempt.getId()).isEqualTo(1L);
        assertThat(attempt.getLessonAttempt()).isEqualTo(lessonAttempt);
        assertThat(attempt.getExercise()).isEqualTo(exercise);
        assertThat(attempt.getSubmittedAnswer()).isEqualTo("Baddi Rou7");
        assertThat(attempt.getNormalizedAnswer()).isEqualTo("baddi rou7");
        assertThat(attempt.getSelectedOptionId()).isEqualTo(2L);
        assertThat(attempt.isCorrect()).isTrue();
        assertThat(attempt.getAnsweredAt()).isNotNull();
    }

    @Test
    void lessonAttempt_getters_setters_and_markCompleted_work() {
        User user = new User();
        Lesson lesson = new Lesson();

        LessonAttempt attempt = new LessonAttempt();
        setId(attempt, 1L);

        attempt.setUser(user);
        attempt.setLesson(lesson);
        attempt.setStatus(LessonAttemptStatus.IN_PROGRESS);

        assertThat(attempt.getId()).isEqualTo(1L);
        assertThat(attempt.getUser()).isEqualTo(user);
        assertThat(attempt.getLesson()).isEqualTo(lesson);
        assertThat(attempt.getStatus()).isEqualTo(LessonAttemptStatus.IN_PROGRESS);
        assertThat(attempt.getStartedAt()).isNotNull();
        assertThat(attempt.getCompletedAt()).isNull();

        attempt.markCompleted();

        assertThat(attempt.getStatus()).isEqualTo(LessonAttemptStatus.COMPLETED);
        assertThat(attempt.getCompletedAt()).isNotNull();
    }

    @Test
    void startLessonAttemptResponse_exposes_fields() {
        StartLessonAttemptResponse response = new StartLessonAttemptResponse(1L, 2L, "IN_PROGRESS");

        assertThat(response.getAttemptId()).isEqualTo(1L);
        assertThat(response.getLessonId()).isEqualTo(2L);
        assertThat(response.getStatus()).isEqualTo("IN_PROGRESS");
    }

    @Test
    void lessonAttemptStatus_values_are_available() {
        assertThat(LessonAttemptStatus.valueOf("IN_PROGRESS")).isEqualTo(LessonAttemptStatus.IN_PROGRESS);
        assertThat(LessonAttemptStatus.valueOf("COMPLETED")).isEqualTo(LessonAttemptStatus.COMPLETED);
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