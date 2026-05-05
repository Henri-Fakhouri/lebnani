package com.henri.lebnani.progress;

import com.henri.lebnani.attempt.LessonAttempt;
import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.course.Course;
import com.henri.lebnani.course.CourseRepository;
import com.henri.lebnani.course.CourseUnit;
import com.henri.lebnani.course.CourseUnitRepository;
import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.course.LessonRepository;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SuppressWarnings("null")
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
    void applyLessonCompletion_awards_xp_creates_progress_and_creates_streak_for_first_completion() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(5L, "Lesson 5", 1, null);
        LessonAttempt attempt = buildLessonAttempt(lesson);

        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 5L)).thenReturn(Optional.empty());
        when(xpCalculator.calculateLessonCompletionXp(100)).thenReturn(10);
        when(streakStateRepository.findByUserId(1L)).thenReturn(Optional.empty());

        int xp = progressService.applyLessonCompletion(user, attempt, 100);

        assertThat(xp).isEqualTo(10);

        ArgumentCaptor<XpEvent> xpEventCaptor = ArgumentCaptor.forClass(XpEvent.class);
        verify(xpEventRepository).save(xpEventCaptor.capture());
        assertThat(xpEventCaptor.getValue().getUser()).isEqualTo(user);
        assertThat(xpEventCaptor.getValue().getLessonAttempt()).isEqualTo(attempt);
        assertThat(xpEventCaptor.getValue().getAmount()).isEqualTo(10);
        assertThat(xpEventCaptor.getValue().getReason()).isEqualTo("LESSON_COMPLETED");

        ArgumentCaptor<UserLessonProgress> progressCaptor = ArgumentCaptor.forClass(UserLessonProgress.class);
        verify(userLessonProgressRepository).save(progressCaptor.capture());
        assertThat(progressCaptor.getValue().getUser()).isEqualTo(user);
        assertThat(progressCaptor.getValue().getLesson()).isEqualTo(lesson);
        assertThat(progressCaptor.getValue().isCompleted()).isTrue();
        assertThat(progressCaptor.getValue().getBestScorePercent()).isEqualTo(100);
        assertThat(progressCaptor.getValue().getCompletedAt()).isNotNull();

        ArgumentCaptor<StreakState> streakCaptor = ArgumentCaptor.forClass(StreakState.class);
        verify(streakStateRepository).save(streakCaptor.capture());
        assertThat(streakCaptor.getValue().getUser()).isEqualTo(user);
        assertThat(streakCaptor.getValue().getCurrentStreak()).isEqualTo(1);
        assertThat(streakCaptor.getValue().getLongestStreak()).isEqualTo(1);
        assertThat(streakCaptor.getValue().getLastActivityDate()).isNotNull();
    }

    @Test
    void applyLessonCompletion_awards_no_xp_when_already_completed_but_still_updates_progress_and_streak() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(5L, "Lesson 5", 1, null);
        LessonAttempt attempt = buildLessonAttempt(lesson);

        UserLessonProgress existingProgress = new UserLessonProgress();
        existingProgress.setUser(user);
        existingProgress.setLesson(lesson);
        existingProgress.updateCompletion(80);

        StreakState existingStreak = new StreakState();
        existingStreak.setUser(user);

        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 5L))
                .thenReturn(Optional.of(existingProgress));
        when(streakStateRepository.findByUserId(1L)).thenReturn(Optional.of(existingStreak));

        int xp = progressService.applyLessonCompletion(user, attempt, 100);

        assertThat(xp).isZero();
        assertThat(existingProgress.getBestScorePercent()).isEqualTo(100);
        assertThat(existingStreak.getCurrentStreak()).isEqualTo(1);

        verify(xpEventRepository, never()).save(any(XpEvent.class));
        verify(userLessonProgressRepository).save(existingProgress);
        verify(streakStateRepository).save(existingStreak);
    }

    @Test
    void applyLessonCompletion_updates_existing_incomplete_progress_and_awards_xp() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(5L, "Lesson 5", 1, null);
        LessonAttempt attempt = buildLessonAttempt(lesson);

        UserLessonProgress existingProgress = new UserLessonProgress();
        existingProgress.setUser(user);
        existingProgress.setLesson(lesson);

        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 5L))
                .thenReturn(Optional.of(existingProgress));
        when(xpCalculator.calculateLessonCompletionXp(75)).thenReturn(7);
        when(streakStateRepository.findByUserId(1L)).thenReturn(Optional.empty());

        int xp = progressService.applyLessonCompletion(user, attempt, 75);

        assertThat(xp).isEqualTo(7);
        assertThat(existingProgress.isCompleted()).isTrue();
        assertThat(existingProgress.getBestScorePercent()).isEqualTo(75);

        verify(xpEventRepository).save(any(XpEvent.class));
        verify(userLessonProgressRepository).save(existingProgress);
    }

    @Test
    void applyLessonCompletion_does_not_save_xp_event_when_calculator_returns_zero() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(5L, "Lesson 5", 1, null);
        LessonAttempt attempt = buildLessonAttempt(lesson);

        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 5L)).thenReturn(Optional.empty());
        when(xpCalculator.calculateLessonCompletionXp(20)).thenReturn(0);
        when(streakStateRepository.findByUserId(1L)).thenReturn(Optional.empty());

        int xp = progressService.applyLessonCompletion(user, attempt, 20);

        assertThat(xp).isZero();
        verify(xpEventRepository, never()).save(any(XpEvent.class));
        verify(userLessonProgressRepository).save(any(UserLessonProgress.class));
        verify(streakStateRepository).save(any(StreakState.class));
    }

    // ── getUserProgress ──────────────────────────────────────────────────────

    @Test
    void getUserProgress_returns_zeroes_when_no_activity() {
        User user = buildUser(1L);
        when(xpEventRepository.sumXpByUserId(1L)).thenReturn(0);
        when(userLessonProgressRepository.countByUserIdAndCompletedTrue(1L)).thenReturn(0L);
        when(streakStateRepository.findByUserId(1L)).thenReturn(Optional.empty());

        UserProgressResponse response = progressService.getUserProgress(user);

        assertThat(response.getTotalXp()).isZero();
        assertThat(response.getCompletedLessons()).isZero();
        assertThat(response.getCurrentStreak()).isZero();
        assertThat(response.getLongestStreak()).isZero();
    }

    @Test
    void getUserProgress_returns_streak_from_state() {
        User user = buildUser(1L);

        StreakState state = new StreakState();
        state.setUser(user);
        state.registerActivity(java.time.LocalDate.now().minusDays(1));
        state.registerActivity(java.time.LocalDate.now());

        when(xpEventRepository.sumXpByUserId(1L)).thenReturn(100);
        when(userLessonProgressRepository.countByUserIdAndCompletedTrue(1L)).thenReturn(5L);
        when(streakStateRepository.findByUserId(1L)).thenReturn(Optional.of(state));

        UserProgressResponse response = progressService.getUserProgress(user);

        assertThat(response.getTotalXp()).isEqualTo(100);
        assertThat(response.getCompletedLessons()).isEqualTo(5L);
        assertThat(response.getCurrentStreak()).isEqualTo(2);
        assertThat(response.getLongestStreak()).isEqualTo(2);
    }

    // ── getCourseProgress ────────────────────────────────────────────────────

    @Test
    void getCourseProgress_throws_when_course_id_is_null() {
        User user = buildUser(1L);

        assertThatThrownBy(() -> progressService.getCourseProgress(null, user))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void getCourseProgress_throws_when_course_not_found() {
        User user = buildUser(1L);
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> progressService.getCourseProgress(99L, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Course not found");
    }

    @Test
    void getCourseProgress_returns_zero_progress_when_course_has_no_units_or_lessons() {
        User user = buildUser(1L);
        Course course = buildCourse(1L, "Arabic");

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(courseUnitRepository.findByCourseIdAndPublishedTrueOrderByDisplayOrderAsc(1L)).thenReturn(List.of());
        when(lessonRepository.findByUnitCourseIdAndPublishedTrueOrderByUnitDisplayOrderAscDisplayOrderAsc(1L))
                .thenReturn(List.of());
        when(userLessonProgressRepository.findByUserId(1L)).thenReturn(List.of());

        CourseProgressResponse response = progressService.getCourseProgress(1L, user);

        assertThat(response.getCourseId()).isEqualTo(1L);
        assertThat(response.getCourseTitle()).isEqualTo("Arabic");
        assertThat(response.getTotalLessons()).isZero();
        assertThat(response.getCompletedLessons()).isZero();
        assertThat(response.getCompletionPercent()).isZero();
        assertThat(response.getUnits()).isEmpty();
    }

    @Test
    void getCourseProgress_maps_units_lessons_completed_and_incomplete_progress() {
        User user = buildUser(1L);
        Course course = buildCourse(1L, "Arabic");

        CourseUnit unitOne = buildUnit(10L, "Unit 1", 1);
        CourseUnit unitTwo = buildUnit(20L, "Unit 2", 2);
        CourseUnit emptyUnit = buildUnit(30L, "Empty Unit", 3);

        Lesson lessonTwo = buildLesson(200L, "Lesson 2", 2, unitOne);
        Lesson lessonOne = buildLesson(100L, "Lesson 1", 1, unitOne);
        Lesson lessonThree = buildLesson(300L, "Lesson 3", 1, unitTwo);

        UserLessonProgress completedProgress = new UserLessonProgress();
        completedProgress.setUser(user);
        completedProgress.setLesson(lessonOne);
        completedProgress.updateCompletion(90);

        UserLessonProgress incompleteProgress = new UserLessonProgress();
        incompleteProgress.setUser(user);
        incompleteProgress.setLesson(lessonTwo);
        setField(incompleteProgress, "bestScorePercent", 40);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(courseUnitRepository.findByCourseIdAndPublishedTrueOrderByDisplayOrderAsc(1L))
                .thenReturn(List.of(unitOne, unitTwo, emptyUnit));
        when(lessonRepository.findByUnitCourseIdAndPublishedTrueOrderByUnitDisplayOrderAscDisplayOrderAsc(1L))
                .thenReturn(List.of(lessonTwo, lessonThree, lessonOne));
        when(userLessonProgressRepository.findByUserId(1L))
                .thenReturn(List.of(completedProgress, incompleteProgress));

        CourseProgressResponse response = progressService.getCourseProgress(1L, user);

        assertThat(response.getCourseId()).isEqualTo(1L);
        assertThat(response.getCourseTitle()).isEqualTo("Arabic");
        assertThat(response.getTotalLessons()).isEqualTo(3);
        assertThat(response.getCompletedLessons()).isEqualTo(1);
        assertThat(response.getCompletionPercent()).isEqualTo(33);
        assertThat(response.getUnits()).hasSize(3);

        UnitProgressResponse firstUnit = response.getUnits().get(0);
        assertThat(firstUnit.getUnitId()).isEqualTo(10L);
        assertThat(firstUnit.getTitle()).isEqualTo("Unit 1");
        assertThat(firstUnit.getDisplayOrder()).isEqualTo(1);
        assertThat(firstUnit.getTotalLessons()).isEqualTo(2);
        assertThat(firstUnit.getCompletedLessons()).isEqualTo(1);
        assertThat(firstUnit.getCompletionPercent()).isEqualTo(50);
        assertThat(firstUnit.getLessons())
                .extracting(LessonProgressResponse::getLessonId)
                .containsExactly(100L, 200L);

        LessonProgressResponse completedLesson = firstUnit.getLessons().get(0);
        assertThat(completedLesson.getTitle()).isEqualTo("Lesson 1");
        assertThat(completedLesson.getDisplayOrder()).isEqualTo(1);
        assertThat(completedLesson.isCompleted()).isTrue();
        assertThat(completedLesson.getBestScorePercent()).isEqualTo(90);

        LessonProgressResponse incompleteLesson = firstUnit.getLessons().get(1);
        assertThat(incompleteLesson.getTitle()).isEqualTo("Lesson 2");
        assertThat(incompleteLesson.isCompleted()).isFalse();
        assertThat(incompleteLesson.getBestScorePercent()).isEqualTo(40);

        UnitProgressResponse secondUnit = response.getUnits().get(1);
        assertThat(secondUnit.getTotalLessons()).isEqualTo(1);
        assertThat(secondUnit.getCompletedLessons()).isZero();
        assertThat(secondUnit.getCompletionPercent()).isZero();
        assertThat(secondUnit.getLessons().get(0).getBestScorePercent()).isZero();

        UnitProgressResponse thirdUnit = response.getUnits().get(2);
        assertThat(thirdUnit.getTotalLessons()).isZero();
        assertThat(thirdUnit.getCompletedLessons()).isZero();
        assertThat(thirdUnit.getCompletionPercent()).isZero();
        assertThat(thirdUnit.getLessons()).isEmpty();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private User buildUser(Long id) {
        User user = new User();
        setId(user, id);
        return user;
    }

    private Course buildCourse(Long id, String title) {
        Course course = new Course();
        setId(course, id);
        course.setTitle(title);
        return course;
    }

    private CourseUnit buildUnit(Long id, String title, int displayOrder) {
        CourseUnit unit = new CourseUnit();
        setId(unit, id);
        unit.setTitle(title);
        unit.setDisplayOrder(displayOrder);
        return unit;
    }

    private Lesson buildLesson(Long id, String title, int displayOrder, CourseUnit unit) {
        Lesson lesson = new Lesson();
        setId(lesson, id);
        lesson.setTitle(title);
        lesson.setDisplayOrder(displayOrder);
        lesson.setUnit(unit);
        return lesson;
    }

    private LessonAttempt buildLessonAttempt(Lesson lesson) {
        LessonAttempt attempt = new LessonAttempt();
        setField(attempt, "lesson", lesson);
        return attempt;
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