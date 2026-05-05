package com.henri.lebnani.progress;

import com.henri.lebnani.attempt.LessonAttempt;
import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ProgressModelTest {

    @Test
    void courseProgressResponse_exposes_fields_and_zero_percent_when_no_lessons() {
        CourseProgressResponse response = new CourseProgressResponse(
                1L,
                "Arabic",
                0,
                0,
                List.of()
        );

        assertThat(response.getCourseId()).isEqualTo(1L);
        assertThat(response.getCourseTitle()).isEqualTo("Arabic");
        assertThat(response.getTotalLessons()).isZero();
        assertThat(response.getCompletedLessons()).isZero();
        assertThat(response.getCompletionPercent()).isZero();
        assertThat(response.getUnits()).isEmpty();
    }

    @Test
    void courseProgressResponse_calculates_completion_percent() {
        CourseProgressResponse response = new CourseProgressResponse(
                1L,
                "Arabic",
                3,
                2,
                List.of()
        );

        assertThat(response.getCompletionPercent()).isEqualTo(67);
    }

    @Test
    void unitProgressResponse_exposes_fields_and_zero_percent_when_no_lessons() {
        UnitProgressResponse response = new UnitProgressResponse(
                10L,
                "Basics",
                1,
                0,
                0,
                List.of()
        );

        assertThat(response.getUnitId()).isEqualTo(10L);
        assertThat(response.getTitle()).isEqualTo("Basics");
        assertThat(response.getDisplayOrder()).isEqualTo(1);
        assertThat(response.getTotalLessons()).isZero();
        assertThat(response.getCompletedLessons()).isZero();
        assertThat(response.getCompletionPercent()).isZero();
        assertThat(response.getLessons()).isEmpty();
    }

    @Test
    void unitProgressResponse_calculates_completion_percent() {
        UnitProgressResponse response = new UnitProgressResponse(
                10L,
                "Basics",
                1,
                4,
                3,
                List.of()
        );

        assertThat(response.getCompletionPercent()).isEqualTo(75);
    }

    @Test
    void lessonProgressResponse_exposes_fields() {
        LessonProgressResponse response = new LessonProgressResponse(
                100L,
                "Greetings",
                2,
                true,
                90
        );

        assertThat(response.getLessonId()).isEqualTo(100L);
        assertThat(response.getTitle()).isEqualTo("Greetings");
        assertThat(response.getDisplayOrder()).isEqualTo(2);
        assertThat(response.isCompleted()).isTrue();
        assertThat(response.getBestScorePercent()).isEqualTo(90);
    }

    @Test
    void userProgressResponse_exposes_fields() {
        UserProgressResponse response = new UserProgressResponse(120, 7L, 3, 5);

        assertThat(response.getTotalXp()).isEqualTo(120);
        assertThat(response.getCompletedLessons()).isEqualTo(7L);
        assertThat(response.getCurrentStreak()).isEqualTo(3);
        assertThat(response.getLongestStreak()).isEqualTo(5);
    }

    @Test
    void userLessonProgress_exposes_defaults_and_relationships() {
        User user = new User();
        Lesson lesson = new Lesson();

        UserLessonProgress progress = new UserLessonProgress();
        setId(progress, 1L);
        progress.setUser(user);
        progress.setLesson(lesson);

        assertThat(progress.getId()).isEqualTo(1L);
        assertThat(progress.getUser()).isEqualTo(user);
        assertThat(progress.getLesson()).isEqualTo(lesson);
        assertThat(progress.isCompleted()).isFalse();
        assertThat(progress.getBestScorePercent()).isZero();
        assertThat(progress.getCompletedAt()).isNull();
        assertThat(progress.getUpdatedAt()).isNotNull();
    }

    @Test
    void userLessonProgress_updateCompletion_marks_completed_and_keeps_best_score() {
        UserLessonProgress progress = new UserLessonProgress();

        progress.updateCompletion(80);
        Instant firstCompletedAt = progress.getCompletedAt();

        progress.updateCompletion(60);

        assertThat(progress.isCompleted()).isTrue();
        assertThat(progress.getBestScorePercent()).isEqualTo(80);
        assertThat(progress.getCompletedAt()).isEqualTo(firstCompletedAt);

        progress.updateCompletion(95);

        assertThat(progress.getBestScorePercent()).isEqualTo(95);
        assertThat(progress.getCompletedAt()).isEqualTo(firstCompletedAt);
        assertThat(progress.getUpdatedAt()).isNotNull();
    }

    @Test
    void streakState_exposes_defaults_and_user() {
        User user = new User();

        StreakState state = new StreakState();
        setId(state, 2L);
        state.setUser(user);

        assertThat(state.getId()).isEqualTo(2L);
        assertThat(state.getUser()).isEqualTo(user);
        assertThat(state.getCurrentStreak()).isZero();
        assertThat(state.getLongestStreak()).isZero();
        assertThat(state.getLastActivityDate()).isNull();
        assertThat(state.getUpdatedAt()).isNotNull();
    }

    @Test
    void streakState_registerActivity_covers_all_streak_paths() {
        StreakState state = new StreakState();
        LocalDate today = LocalDate.now();

        state.registerActivity(today.minusDays(2));
        assertThat(state.getCurrentStreak()).isEqualTo(1);
        assertThat(state.getLongestStreak()).isEqualTo(1);

        state.registerActivity(today.minusDays(2));
        assertThat(state.getCurrentStreak()).isEqualTo(1);
        assertThat(state.getLongestStreak()).isEqualTo(1);

        state.registerActivity(today.minusDays(1));
        assertThat(state.getCurrentStreak()).isEqualTo(2);
        assertThat(state.getLongestStreak()).isEqualTo(2);

        state.registerActivity(today);
        assertThat(state.getCurrentStreak()).isEqualTo(3);
        assertThat(state.getLongestStreak()).isEqualTo(3);

        state.registerActivity(today.plusDays(5));
        assertThat(state.getCurrentStreak()).isEqualTo(1);
        assertThat(state.getLongestStreak()).isEqualTo(3);
        assertThat(state.getLastActivityDate()).isEqualTo(today.plusDays(5));
        assertThat(state.getUpdatedAt()).isNotNull();
    }

    @Test
    void xpEvent_exposes_fields() {
        User user = new User();
        LessonAttempt attempt = new LessonAttempt();

        XpEvent event = new XpEvent();
        setId(event, 3L);
        event.setUser(user);
        event.setLessonAttempt(attempt);
        event.setAmount(10);
        event.setReason("LESSON_COMPLETED");

        assertThat(event.getId()).isEqualTo(3L);
        assertThat(event.getUser()).isEqualTo(user);
        assertThat(event.getLessonAttempt()).isEqualTo(attempt);
        assertThat(event.getAmount()).isEqualTo(10);
        assertThat(event.getReason()).isEqualTo("LESSON_COMPLETED");
        assertThat(event.getCreatedAt()).isNotNull();
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