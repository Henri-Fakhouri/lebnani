package com.henri.lebnani.content;

import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.course.Course;
import com.henri.lebnani.course.CourseRepository;
import com.henri.lebnani.course.CourseUnitRepository;
import com.henri.lebnani.course.LessonContentBlockRepository;
import com.henri.lebnani.course.LessonRepository;
import com.henri.lebnani.exercise.ExerciseAcceptedAnswerRepository;
import com.henri.lebnani.exercise.ExerciseOptionRepository;
import com.henri.lebnani.exercise.ExerciseRepository;
import com.henri.lebnani.user.Role;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ContentImportServiceTest {

    @Mock CourseRepository courseRepository;
    @Mock CourseUnitRepository courseUnitRepository;
    @Mock LessonRepository lessonRepository;
    @Mock LessonContentBlockRepository lessonContentBlockRepository;
    @Mock ExerciseRepository exerciseRepository;
    @Mock ExerciseOptionRepository exerciseOptionRepository;
    @Mock ExerciseAcceptedAnswerRepository acceptedAnswerRepository;
    @Mock ContentImportValidator contentImportValidator;
    @Mock ContentImportRunRepository contentImportRunRepository;

    @InjectMocks ContentImportService contentImportService;

    @Test
    void importContent_throws_when_user_is_learner() {
        User learner = buildUser(1L, Role.LEARNER);
        ContentImportRequest request = mock(ContentImportRequest.class);

        assertThatThrownBy(() -> contentImportService.importContent(1L, request, learner))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Only admins or content editors");
    }

    @Test
    void importContent_throws_when_course_not_found() {
        User admin = buildUser(1L, Role.ADMIN);
        ContentImportRequest request = mock(ContentImportRequest.class);

        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contentImportService.importContent(99L, request, admin))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Course not found");
    }

    @Test
    @SuppressWarnings("null")
    void importContent_marks_run_failed_when_validation_throws() {
        User admin = buildUser(1L, Role.ADMIN);
        Course course = buildCourse(1L);
        ContentImportRun run = buildRun(10L);
        ContentImportRequest request = mock(ContentImportRequest.class);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(contentImportRunRepository.save(isA(ContentImportRun.class))).thenReturn(run);
        doThrow(new ContentValidationException(List.of()))
                .when(contentImportValidator).validate(request);

        assertThatThrownBy(() -> contentImportService.importContent(1L, request, admin))
                .isInstanceOf(ContentValidationException.class);

        verify(run).markFailed(any());
    }

    @Test
    @SuppressWarnings("null")
    void importContent_success_with_empty_units() {
        User admin = buildUser(1L, Role.ADMIN);
        Course course = buildCourse(1L);
        ContentImportRun run = buildRun(10L);
        ContentImportRequest request = mock(ContentImportRequest.class);

        when(request.getUnits()).thenReturn(List.of());
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(contentImportRunRepository.save(isA(ContentImportRun.class))).thenReturn(run);
        doNothing().when(contentImportValidator).validate(request);

        ContentImportResponse response = contentImportService.importContent(1L, request, admin);

        assertThat(response).isNotNull();
        verify(run).markCompleted(any());
    }

    @Test
    void getImportRuns_throws_when_user_is_learner() {
        User learner = buildUser(1L, Role.LEARNER);

        assertThatThrownBy(() -> contentImportService.getImportRuns(1L, learner))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void getImportRuns_returns_runs_for_admin() {
        User admin = buildUser(1L, Role.ADMIN);

        when(contentImportRunRepository.findByCourseIdOrderByStartedAtDesc(1L)).thenReturn(List.of());

        List<ContentImportRunResponse> result = contentImportService.getImportRuns(1L, admin);

        assertThat(result).isEmpty();
    }

    private User buildUser(Long id, Role role) {
        User user = new User();
        user.setRole(role);
        setId(user, id);
        return user;
    }

    private Course buildCourse(Long id) {
        Course course = mock(Course.class);
        when(course.getId()).thenReturn(id);
        return course;
    }

    private ContentImportRun buildRun(Long id) {
        ContentImportRun run = mock(ContentImportRun.class);
        when(run.getId()).thenReturn(id);
        return run;
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