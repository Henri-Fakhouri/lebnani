package com.henri.lebnani.attempt;

import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.course.LessonRepository;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.exercise.ExerciseAcceptedAnswer;
import com.henri.lebnani.exercise.ExerciseOptionRepository;
import com.henri.lebnani.exercise.ExerciseRepository;
import com.henri.lebnani.exercise.ExerciseType;
import com.henri.lebnani.progress.ProgressService;
import com.henri.lebnani.review.ReviewService;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.*;

@SuppressWarnings("null")
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LessonAttemptServiceTest {

    @Mock LessonRepository lessonRepository;
    @Mock ExerciseRepository exerciseRepository;
    @Mock ExerciseOptionRepository exerciseOptionRepository;
    @Mock LessonAttemptRepository lessonAttemptRepository;
    @Mock ExerciseAttemptRepository exerciseAttemptRepository;
    @Mock AnswerNormalizer answerNormalizer;
    @Mock ProgressService progressService;
    @Mock ReviewService reviewService;

    @InjectMocks LessonAttemptService lessonAttemptService;

    @Test
    void startAttempt_returns_response_for_existing_lesson() {
        Lesson lesson = buildLesson(1L);
        User user = buildUser(1L);
        LessonAttempt saved = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);

        when(lessonRepository.findById(1L)).thenReturn(Optional.of(lesson));
        when(lessonAttemptRepository.save(isA(LessonAttempt.class))).thenReturn(saved);

        StartLessonAttemptResponse response = lessonAttemptService.startAttempt(1L, user);

        assertThat(response).isNotNull();
    }

    @Test
    void startAttempt_throws_when_lesson_not_found() {
        User user = buildUser(1L);

        when(lessonRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lessonAttemptService.startAttempt(99L, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Lesson not found");
    }

    @Test
    void submitAnswer_throws_when_attempt_not_found() {
        User user = buildUser(1L);
        AnswerSubmissionRequest request = mock(AnswerSubmissionRequest.class);

        when(lessonAttemptRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(99L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Lesson attempt not found");
    }

    @Test
    void submitAnswer_throws_when_attempt_belongs_to_other_user() {
        User owner = buildUser(1L);
        User other = buildUser(2L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, owner, LessonAttemptStatus.IN_PROGRESS);
        AnswerSubmissionRequest request = mock(AnswerSubmissionRequest.class);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, other))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("does not belong");
    }

    @Test
    void submitAnswer_throws_when_attempt_not_in_progress() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.COMPLETED);
        AnswerSubmissionRequest request = mock(AnswerSubmissionRequest.class);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not in progress");
    }

    @Test
    void submitAnswer_throws_when_exercise_already_answered() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);

        AnswerSubmissionRequest request = mock(AnswerSubmissionRequest.class);
        when(request.getExerciseId()).thenReturn(5L);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(true);

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already been answered");
    }

    @Test
    void submitAnswer_typed_answer_correct() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);

        Exercise exercise = buildExercise(5L, ExerciseType.TYPE_ANSWER, lesson);
        ExerciseAcceptedAnswer accepted = mock(ExerciseAcceptedAnswer.class);

        when(accepted.getAnswerText()).thenReturn("baddi rou7");
        when(exercise.getAcceptedAnswers()).thenReturn(Set.of(accepted));

        AnswerSubmissionRequest request = mock(AnswerSubmissionRequest.class);
        when(request.getExerciseId()).thenReturn(5L);
        when(request.getAnswer()).thenReturn("baddi rou7");

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));
        when(answerNormalizer.normalize("baddi rou7")).thenReturn("baddi rou7");

        ExerciseAttempt savedAttempt = mock(ExerciseAttempt.class);
        when(savedAttempt.getId()).thenReturn(20L);
        when(savedAttempt.isCorrect()).thenReturn(true);
        when(exerciseAttemptRepository.save(isA(ExerciseAttempt.class))).thenReturn(savedAttempt);

        AnswerSubmissionResponse response = lessonAttemptService.submitAnswer(10L, request, user);

        assertThat(response).isNotNull();
        assertThat(response.isCorrect()).isTrue();
    }

    @Test
    void submitAnswer_multiple_choice_throws_when_no_option_id() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, ExerciseType.MULTIPLE_CHOICE, lesson);

        AnswerSubmissionRequest request = mock(AnswerSubmissionRequest.class);
        when(request.getExerciseId()).thenReturn(5L);
        when(request.getSelectedOptionId()).thenReturn(null);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("selectedOptionId is required");
    }

    @Test
    void completeAttempt_throws_when_not_all_exercises_answered() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseRepository.countByLessonIdAndPublishedTrue(1L)).thenReturn(3L);
        when(exerciseAttemptRepository.countByLessonAttemptId(10L)).thenReturn(2L);

        assertThatThrownBy(() -> lessonAttemptService.completeAttempt(10L, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("all lesson exercises");
    }

    @Test
    void completeAttempt_returns_response_when_all_exercises_answered() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseRepository.countByLessonIdAndPublishedTrue(1L)).thenReturn(2L);
        when(exerciseAttemptRepository.countByLessonAttemptId(10L)).thenReturn(2L);
        when(exerciseAttemptRepository.countByLessonAttemptIdAndCorrectTrue(10L)).thenReturn(2L);
        when(progressService.applyLessonCompletion(isA(User.class), isA(LessonAttempt.class), eq(100))).thenReturn(10);

        CompleteLessonAttemptResponse response = lessonAttemptService.completeAttempt(10L, user);

        assertThat(response).isNotNull();
    }

    @Test
    void completeAttempt_throws_when_already_completed() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.COMPLETED);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));

        assertThatThrownBy(() -> lessonAttemptService.completeAttempt(10L, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not in progress");
    }

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

    private LessonAttempt buildAttempt(Long id, Lesson lesson, User user, LessonAttemptStatus status) {
        LessonAttempt attempt = mock(LessonAttempt.class);
        when(attempt.getId()).thenReturn(id);
        when(attempt.getLesson()).thenReturn(lesson);
        when(attempt.getUser()).thenReturn(user);
        when(attempt.getStatus()).thenReturn(status);
        return attempt;
    }

    private Exercise buildExercise(Long id, ExerciseType type, Lesson lesson) {
        Exercise exercise = mock(Exercise.class);
        when(exercise.getId()).thenReturn(id);
        when(exercise.getType()).thenReturn(type);
        when(exercise.getLesson()).thenReturn(lesson);
        return exercise;
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