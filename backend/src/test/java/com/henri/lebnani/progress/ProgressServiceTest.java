package com.henri.lebnani.progress;

import com.henri.lebnani.attempt.LessonAttempt;
import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.course.Course;
import com.henri.lebnani.course.CourseRepository;
import com.henri.lebnani.course.CourseUnitRepository;
import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.course.LessonRepository;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProgressServiceTest {

    @Mock XpCalculator xpCalculator;
    @Mock XpEventRepository xpEventRepository;
    @Mock UserLessonProgressRepository userLessonProgressRepository;
    @Mock StreakStateRepository streakStateRepository;
    @Mock CourseRepository courseRepository;
    @Mock CourseUnitRepository courseUnitRepository;
    @Mock LessonRepository lessonRepository;
    @InjectMocks ProgressService progressService;

    // ── applyLessonCompletion ────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    void applyLessonCompletion_awards_xp_for_first_completion() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(5L);
        LessonAttempt attempt = mock(LessonAttempt.class);
        when(attempt.getLesson()).thenReturn(lesson);

        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 5L)).thenReturn(Optional.empty());
        when(xpCalculator.calculateLessonCompletionXp(100)).thenReturn(10);
        when(streakStateRepository.findByUserId(1L)).thenReturn(Optional.empty());

        int xp = progressService.applyLessonCompletion(user, attempt, 100);

        assertThat(xp).isEqualTo(10);
        verify(xpEventRepository).save(isA(XpEvent.class));
    }

    @Test
    @SuppressWarnings("null")
    void applyLessonCompletion_awards_no_xp_when_already_completed() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(5L);
        LessonAttempt attempt = mock(LessonAttempt.class);
        when(attempt.getLesson()).thenReturn(lesson);

        UserLessonProgress existing = mock(UserLessonProgress.class);
        when(existing.isCompleted()).thenReturn(true);
        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 5L))
                .thenReturn(Optional.of(existing));
        when(streakStateRepository.findByUserId(1L)).thenReturn(Optional.empty());

        int xp = progressService.applyLessonCompletion(user, attempt, 100);

        assertThat(xp).isZero();
        verify(xpEventRepository, never()).save(isA(XpEvent.class));
    }

    @Test
    @SuppressWarnings("null")
    void applyLessonCompletion_updates_streak() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(5L);
        LessonAttempt attempt = mock(LessonAttempt.class);
        when(attempt.getLesson()).thenReturn(lesson);

        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 5L)).thenReturn(Optional.empty());
        when(xpCalculator.calculateLessonCompletionXp(anyInt())).thenReturn(5);
        when(streakStateRepository.findByUserId(1L)).thenReturn(Optional.empty());

        progressService.applyLessonCompletion(user, attempt, 50);

        verify(streakStateRepository).save(isA(StreakState.class));
    }

    // ── getUserProgress ──────────────────────────────────────────────────────

    @Test
    void getUserProgress_returns_zeroes_when_no_activity() {
        User user = buildUser(1L);
        when(xpEventRepository.sumXpByUserId(1L)).thenReturn(0);
        when(userLessonProgressRepository.countByUserIdAndCompletedTrue(1L)).thenReturn(0L);
        when(streakStateRepository.findByUserId(1L)).thenReturn(Optional.empty());

        UserProgressResponse res = progressService.getUserProgress(user);

        assertThat(res.getTotalXp()).isZero();
        assertThat(res.getCurrentStreak()).isZero();
        assertThat(res.getLongestStreak()).isZero();
    }

    @Test
    void getUserProgress_returns_streak_from_state() {
        User user = buildUser(1L);
        StreakState state = mock(StreakState.class);
        when(state.getCurrentStreak()).thenReturn(7);
        when(state.getLongestStreak()).thenReturn(14);

        when(xpEventRepository.sumXpByUserId(1L)).thenReturn(100);
        when(userLessonProgressRepository.countByUserIdAndCompletedTrue(1L)).thenReturn(5L);
        when(streakStateRepository.findByUserId(1L)).thenReturn(Optional.of(state));

        UserProgressResponse res = progressService.getUserProgress(user);

        assertThat(res.getCurrentStreak()).isEqualTo(7);
        assertThat(res.getLongestStreak()).isEqualTo(14);
        assertThat(res.getTotalXp()).isEqualTo(100);
    }

    // ── getCourseProgress ────────────────────────────────────────────────────

    @Test
    void getCourseProgress_throws_when_course_not_found() {
        User user = buildUser(1L);
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> progressService.getCourseProgress(99L, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Course not found");
    }

    @Test
    void getCourseProgress_returns_response_for_existing_course() {
        User user = buildUser(1L);
        Course course = mock(Course.class);
        when(course.getId()).thenReturn(1L);
        when(course.getTitle()).thenReturn("Arabic");

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(courseUnitRepository.findByCourseIdAndPublishedTrueOrderByDisplayOrderAsc(1L)).thenReturn(List.of());
        when(lessonRepository.findByUnitCourseIdAndPublishedTrueOrderByUnitDisplayOrderAscDisplayOrderAsc(1L))
                .thenReturn(List.of());
        when(userLessonProgressRepository.findByUserId(1L)).thenReturn(List.of());

        CourseProgressResponse res = progressService.getCourseProgress(1L, user);

        assertThat(res).isNotNull();
        assertThat(res.getTotalLessons()).isZero();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private User buildUser(Long id) {
        User user = new User();
        setId(user, id);
        return user;
    }

    private Lesson buildLesson(Long id) {
        Lesson lesson = mock(Lesson.class);
        when(lesson.getId()).thenReturn(id);
        return lesson;
    }

    private static void setId(Object entity, Long id) {
        try {
            var field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception exception) {
            throw new RuntimeException(exception);
        }
    }
}