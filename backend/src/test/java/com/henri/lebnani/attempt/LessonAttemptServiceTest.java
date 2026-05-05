package com.henri.lebnani.attempt;

import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.course.LessonRepository;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.exercise.ExerciseAcceptedAnswer;
import com.henri.lebnani.exercise.ExerciseOption;
import com.henri.lebnani.exercise.ExerciseOptionRepository;
import com.henri.lebnani.exercise.ExerciseRepository;
import com.henri.lebnani.exercise.ExerciseType;
import com.henri.lebnani.progress.ProgressService;
import com.henri.lebnani.review.ReviewService;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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

    // ── startAttempt ─────────────────────────────────────────────────────────

    @Test
    void startAttempt_throws_when_lesson_id_is_null() {
        User user = buildUser(1L);

        assertThatThrownBy(() -> lessonAttemptService.startAttempt(null, user))
                .isInstanceOf(NullPointerException.class);
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
    void startAttempt_returns_response_for_existing_lesson() {
        Lesson lesson = buildLesson(1L);
        User user = buildUser(2L);

        when(lessonRepository.findById(1L)).thenReturn(Optional.of(lesson));
        when(lessonAttemptRepository.save(any(LessonAttempt.class))).thenAnswer(invocation -> {
            LessonAttempt attempt = invocation.getArgument(0, LessonAttempt.class);
            setId(attempt, 10L);
            return attempt;
        });

        StartLessonAttemptResponse response = lessonAttemptService.startAttempt(1L, user);

        assertThat(response.getAttemptId()).isEqualTo(10L);
        assertThat(response.getLessonId()).isEqualTo(1L);
        assertThat(response.getStatus()).isEqualTo("IN_PROGRESS");

        ArgumentCaptor<LessonAttempt> captor = ArgumentCaptor.forClass(LessonAttempt.class);
        verify(lessonAttemptRepository).save(captor.capture());

        assertThat(captor.getValue().getLesson()).isEqualTo(lesson);
        assertThat(captor.getValue().getUser()).isEqualTo(user);
        assertThat(captor.getValue().getStatus()).isEqualTo(LessonAttemptStatus.IN_PROGRESS);
    }

    // ── submitAnswer common errors ───────────────────────────────────────────

    @Test
    void submitAnswer_throws_when_attempt_id_is_null() {
        User user = buildUser(1L);
        AnswerSubmissionRequest request = buildAnswerRequest(5L, "answer", null);

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(null, request, user))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void submitAnswer_throws_when_attempt_not_found() {
        User user = buildUser(1L);
        AnswerSubmissionRequest request = buildAnswerRequest(5L, "answer", null);

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
        AnswerSubmissionRequest request = buildAnswerRequest(5L, "answer", null);

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
        AnswerSubmissionRequest request = buildAnswerRequest(5L, "answer", null);

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
        AnswerSubmissionRequest request = buildAnswerRequest(5L, "answer", null);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(true);

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already been answered");
    }

    @Test
    void submitAnswer_throws_when_exercise_id_is_null() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        AnswerSubmissionRequest request = buildAnswerRequest(null, "answer", null);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, user))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void submitAnswer_throws_when_exercise_not_found() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        AnswerSubmissionRequest request = buildAnswerRequest(5L, "answer", null);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Exercise not found");
    }

    @Test
    void submitAnswer_throws_when_exercise_does_not_belong_to_lesson() {
        User user = buildUser(1L);
        Lesson attemptLesson = buildLesson(1L);
        Lesson otherLesson = buildLesson(2L);
        LessonAttempt attempt = buildAttempt(10L, attemptLesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, ExerciseType.TYPE_ANSWER, otherLesson, "expected");
        AnswerSubmissionRequest request = buildAnswerRequest(5L, "answer", null);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("does not belong to the lesson attempt");
    }

    // ── submitAnswer typed answer ────────────────────────────────────────────

    @Test
    void submitAnswer_typed_answer_correct_with_accepted_answers() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, ExerciseType.TYPE_ANSWER, lesson, "fallback answer");

        ExerciseAcceptedAnswer acceptedAnswer = buildAcceptedAnswer(30L, exercise, "baddi rou7", 1);
        exercise.getAcceptedAnswers().add(acceptedAnswer);

        AnswerSubmissionRequest request = buildAnswerRequest(5L, "Baddi Rou7", null);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));
        when(answerNormalizer.normalize("Baddi Rou7")).thenReturn("baddi rou7");
        when(answerNormalizer.normalize("baddi rou7")).thenReturn("baddi rou7");
        when(exerciseAttemptRepository.save(any(ExerciseAttempt.class))).thenAnswer(invocation -> {
            ExerciseAttempt saved = invocation.getArgument(0, ExerciseAttempt.class);
            setId(saved, 20L);
            return saved;
        });

        AnswerSubmissionResponse response = lessonAttemptService.submitAnswer(10L, request, user);

        assertThat(response.getExerciseAttemptId()).isEqualTo(20L);
        assertThat(response.getExerciseId()).isEqualTo(5L);
        assertThat(response.getSubmittedAnswer()).isEqualTo("Baddi Rou7");
        assertThat(response.getNormalizedAnswer()).isEqualTo("baddi rou7");
        assertThat(response.getSelectedOptionId()).isNull();
        assertThat(response.isCorrect()).isTrue();
        assertThat(response.getExpectedAnswer()).isEqualTo("fallback answer");

        verify(reviewService, never()).registerWrongAnswer(any(User.class), any(Exercise.class), any(ExerciseAttempt.class));
    }

    @Test
    void submitAnswer_typed_answer_wrong_with_accepted_answers_registers_review_item() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, ExerciseType.TYPE_ANSWER, lesson, "fallback answer");

        ExerciseAcceptedAnswer acceptedAnswer = buildAcceptedAnswer(30L, exercise, "baddi rou7", 1);
        exercise.getAcceptedAnswers().add(acceptedAnswer);

        AnswerSubmissionRequest request = buildAnswerRequest(5L, "wrong", null);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));
        when(answerNormalizer.normalize("wrong")).thenReturn("wrong");
        when(answerNormalizer.normalize("baddi rou7")).thenReturn("baddi rou7");
        when(exerciseAttemptRepository.save(any(ExerciseAttempt.class))).thenAnswer(invocation -> {
            ExerciseAttempt saved = invocation.getArgument(0, ExerciseAttempt.class);
            setId(saved, 20L);
            return saved;
        });

        AnswerSubmissionResponse response = lessonAttemptService.submitAnswer(10L, request, user);

        assertThat(response.isCorrect()).isFalse();

        ArgumentCaptor<ExerciseAttempt> attemptCaptor = ArgumentCaptor.forClass(ExerciseAttempt.class);
        verify(reviewService).registerWrongAnswer(eq(user), eq(exercise), attemptCaptor.capture());
        assertThat(attemptCaptor.getValue().getId()).isEqualTo(20L);
    }

    @Test
    void submitAnswer_typed_answer_correct_with_fallback_correct_answer_when_no_accepted_answers() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, ExerciseType.TYPE_ANSWER, lesson, "baddi rou7");
        AnswerSubmissionRequest request = buildAnswerRequest(5L, "Baddi Rou7", null);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));
        when(answerNormalizer.normalize("Baddi Rou7")).thenReturn("baddi rou7");
        when(answerNormalizer.normalize("baddi rou7")).thenReturn("baddi rou7");
        when(exerciseAttemptRepository.save(any(ExerciseAttempt.class))).thenAnswer(invocation -> {
            ExerciseAttempt saved = invocation.getArgument(0, ExerciseAttempt.class);
            setId(saved, 20L);
            return saved;
        });

        AnswerSubmissionResponse response = lessonAttemptService.submitAnswer(10L, request, user);

        assertThat(response.isCorrect()).isTrue();
        assertThat(response.getExpectedAnswer()).isEqualTo("baddi rou7");
    }

    @Test
    void submitAnswer_typed_answer_wrong_with_fallback_correct_answer_registers_review_item() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, ExerciseType.TYPE_ANSWER, lesson, "baddi rou7");
        AnswerSubmissionRequest request = buildAnswerRequest(5L, "wrong", null);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));
        when(answerNormalizer.normalize("wrong")).thenReturn("wrong");
        when(answerNormalizer.normalize("baddi rou7")).thenReturn("baddi rou7");
        when(exerciseAttemptRepository.save(any(ExerciseAttempt.class))).thenAnswer(invocation -> {
            ExerciseAttempt saved = invocation.getArgument(0, ExerciseAttempt.class);
            setId(saved, 20L);
            return saved;
        });

        AnswerSubmissionResponse response = lessonAttemptService.submitAnswer(10L, request, user);

        assertThat(response.isCorrect()).isFalse();
        verify(reviewService).registerWrongAnswer(any(User.class), any(Exercise.class), any(ExerciseAttempt.class));
    }

    @Test
    void submitAnswer_typed_answer_throws_when_answer_is_null() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, ExerciseType.TYPE_ANSWER, lesson, "expected");
        AnswerSubmissionRequest request = buildAnswerRequest(5L, null, null);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("answer is required");
    }

    @Test
    void submitAnswer_typed_answer_throws_when_answer_is_blank() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, ExerciseType.TYPE_ANSWER, lesson, "expected");
        AnswerSubmissionRequest request = buildAnswerRequest(5L, "   ", null);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("answer is required");
    }

    // ── submitAnswer multiple choice ─────────────────────────────────────────

    @Test
    void submitAnswer_multiple_choice_throws_when_no_option_id() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, ExerciseType.MULTIPLE_CHOICE, lesson, "Ana");
        AnswerSubmissionRequest request = buildAnswerRequest(5L, null, null);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("selectedOptionId is required");
    }

    @Test
    void submitAnswer_multiple_choice_throws_when_option_not_found() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, ExerciseType.MULTIPLE_CHOICE, lesson, "Ana");
        AnswerSubmissionRequest request = buildAnswerRequest(5L, null, 100L);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));
        when(exerciseOptionRepository.findById(100L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Selected option not found");
    }

    @Test
    void submitAnswer_multiple_choice_throws_when_option_not_in_exercise() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, ExerciseType.MULTIPLE_CHOICE, lesson, "Ana");
        Exercise otherExercise = buildExercise(6L, ExerciseType.MULTIPLE_CHOICE, lesson, "Ana");
        ExerciseOption option = buildOption(100L, otherExercise, "Ana", true, 1);
        AnswerSubmissionRequest request = buildAnswerRequest(5L, null, 100L);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));
        when(exerciseOptionRepository.findById(100L)).thenReturn(Optional.of(option));

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("does not belong to this exercise");
    }

    @Test
    void submitAnswer_multiple_choice_correct_answer_returns_response() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, ExerciseType.MULTIPLE_CHOICE, lesson, "Ana");
        ExerciseOption option = buildOption(100L, exercise, "Ana", true, 1);
        AnswerSubmissionRequest request = buildAnswerRequest(5L, null, 100L);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));
        when(exerciseOptionRepository.findById(100L)).thenReturn(Optional.of(option));
        when(answerNormalizer.normalize("Ana")).thenReturn("ana");
        when(exerciseAttemptRepository.save(any(ExerciseAttempt.class))).thenAnswer(invocation -> {
            ExerciseAttempt saved = invocation.getArgument(0, ExerciseAttempt.class);
            setId(saved, 20L);
            return saved;
        });

        AnswerSubmissionResponse response = lessonAttemptService.submitAnswer(10L, request, user);

        assertThat(response.getExerciseAttemptId()).isEqualTo(20L);
        assertThat(response.getExerciseId()).isEqualTo(5L);
        assertThat(response.getSubmittedAnswer()).isEqualTo("Ana");
        assertThat(response.getNormalizedAnswer()).isEqualTo("ana");
        assertThat(response.getSelectedOptionId()).isEqualTo(100L);
        assertThat(response.isCorrect()).isTrue();
        assertThat(response.getExpectedAnswer()).isEqualTo("Ana");

        verify(reviewService, never()).registerWrongAnswer(any(User.class), any(Exercise.class), any(ExerciseAttempt.class));
    }

    @Test
    void submitAnswer_multiple_choice_wrong_answer_registers_review_item() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, ExerciseType.MULTIPLE_CHOICE, lesson, "Ana");
        ExerciseOption option = buildOption(100L, exercise, "Enta", false, 1);
        AnswerSubmissionRequest request = buildAnswerRequest(5L, null, 100L);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));
        when(exerciseOptionRepository.findById(100L)).thenReturn(Optional.of(option));
        when(answerNormalizer.normalize("Enta")).thenReturn("enta");
        when(exerciseAttemptRepository.save(any(ExerciseAttempt.class))).thenAnswer(invocation -> {
            ExerciseAttempt saved = invocation.getArgument(0, ExerciseAttempt.class);
            setId(saved, 20L);
            return saved;
        });

        AnswerSubmissionResponse response = lessonAttemptService.submitAnswer(10L, request, user);

        assertThat(response.isCorrect()).isFalse();
        verify(reviewService).registerWrongAnswer(any(User.class), any(Exercise.class), any(ExerciseAttempt.class));
    }

    @Test
    void submitAnswer_throws_when_exercise_type_is_unsupported() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);
        Exercise exercise = buildExercise(5L, null, lesson, "expected");
        AnswerSubmissionRequest request = buildAnswerRequest(5L, "answer", null);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(10L, 5L)).thenReturn(false);
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));

        assertThatThrownBy(() -> lessonAttemptService.submitAnswer(10L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Unsupported exercise type");
    }

    // ── completeAttempt ──────────────────────────────────────────────────────

    @Test
    void completeAttempt_throws_when_attempt_id_is_null() {
        User user = buildUser(1L);

        assertThatThrownBy(() -> lessonAttemptService.completeAttempt(null, user))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void completeAttempt_throws_when_attempt_not_found() {
        User user = buildUser(1L);

        when(lessonAttemptRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lessonAttemptService.completeAttempt(99L, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Lesson attempt not found");
    }

    @Test
    void completeAttempt_throws_when_attempt_belongs_to_other_user() {
        User owner = buildUser(1L);
        User other = buildUser(2L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, owner, LessonAttemptStatus.IN_PROGRESS);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));

        assertThatThrownBy(() -> lessonAttemptService.completeAttempt(10L, other))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("does not belong");
    }

    @Test
    void completeAttempt_throws_when_attempt_not_in_progress() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.COMPLETED);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));

        assertThatThrownBy(() -> lessonAttemptService.completeAttempt(10L, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not in progress");
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
        when(exerciseRepository.countByLessonIdAndPublishedTrue(1L)).thenReturn(4L);
        when(exerciseAttemptRepository.countByLessonAttemptId(10L)).thenReturn(4L);
        when(exerciseAttemptRepository.countByLessonAttemptIdAndCorrectTrue(10L)).thenReturn(3L);
        when(progressService.applyLessonCompletion(user, attempt, 75)).thenReturn(7);

        CompleteLessonAttemptResponse response = lessonAttemptService.completeAttempt(10L, user);

        assertThat(response.getAttemptId()).isEqualTo(10L);
        assertThat(response.getLessonId()).isEqualTo(1L);
        assertThat(response.getStatus()).isEqualTo("COMPLETED");
        assertThat(response.getTotalExercises()).isEqualTo(4L);
        assertThat(response.getAnsweredExercises()).isEqualTo(4L);
        assertThat(response.getCorrectAnswers()).isEqualTo(3L);
        assertThat(response.getWrongAnswers()).isEqualTo(1L);
        assertThat(response.getScorePercent()).isEqualTo(75);
        assertThat(response.getXpAwarded()).isEqualTo(7);
        assertThat(attempt.getCompletedAt()).isNotNull();

        verify(progressService).applyLessonCompletion(user, attempt, 75);
    }

    @Test
    void completeAttempt_returns_zero_score_when_lesson_has_zero_exercises() {
        User user = buildUser(1L);
        Lesson lesson = buildLesson(1L);
        LessonAttempt attempt = buildAttempt(10L, lesson, user, LessonAttemptStatus.IN_PROGRESS);

        when(lessonAttemptRepository.findById(10L)).thenReturn(Optional.of(attempt));
        when(exerciseRepository.countByLessonIdAndPublishedTrue(1L)).thenReturn(0L);
        when(exerciseAttemptRepository.countByLessonAttemptId(10L)).thenReturn(0L);
        when(exerciseAttemptRepository.countByLessonAttemptIdAndCorrectTrue(10L)).thenReturn(0L);
        when(progressService.applyLessonCompletion(user, attempt, 0)).thenReturn(0);

        CompleteLessonAttemptResponse response = lessonAttemptService.completeAttempt(10L, user);

        assertThat(response.getScorePercent()).isZero();
        assertThat(response.getWrongAnswers()).isZero();
        assertThat(response.getXpAwarded()).isZero();

        verify(progressService).applyLessonCompletion(user, attempt, 0);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private User buildUser(Long id) {
        User user = new User();
        setId(user, id);
        return user;
    }

    private Lesson buildLesson(Long id) {
        Lesson lesson = new Lesson();
        setId(lesson, id);
        return lesson;
    }

    private LessonAttempt buildAttempt(Long id, Lesson lesson, User user, LessonAttemptStatus status) {
        LessonAttempt attempt = new LessonAttempt();
        setId(attempt, id);
        attempt.setLesson(lesson);
        attempt.setUser(user);
        attempt.setStatus(status);
        return attempt;
    }

    private Exercise buildExercise(Long id, ExerciseType type, Lesson lesson, String correctAnswer) {
        Exercise exercise = new Exercise();
        setId(exercise, id);
        exercise.setType(type);
        exercise.setLesson(lesson);
        exercise.setCorrectAnswer(correctAnswer);
        exercise.setPromptFr("Prompt");
        exercise.setDisplayOrder(1);
        exercise.setPublished(true);
        return exercise;
    }

    private ExerciseOption buildOption(
            Long id,
            Exercise exercise,
            String text,
            boolean correct,
            int displayOrder
    ) {
        ExerciseOption option = new ExerciseOption();
        setId(option, id);
        option.setExercise(exercise);
        option.setTextValue(text);
        option.setCorrect(correct);
        option.setDisplayOrder(displayOrder);
        return option;
    }

    private ExerciseAcceptedAnswer buildAcceptedAnswer(
            Long id,
            Exercise exercise,
            String answerText,
            int displayOrder
    ) {
        ExerciseAcceptedAnswer acceptedAnswer = new ExerciseAcceptedAnswer();
        setId(acceptedAnswer, id);
        acceptedAnswer.setExercise(exercise);
        acceptedAnswer.setAnswerText(answerText);
        acceptedAnswer.setDisplayOrder(displayOrder);
        return acceptedAnswer;
    }

    private AnswerSubmissionRequest buildAnswerRequest(
            Long exerciseId,
            String answer,
            Long selectedOptionId
    ) {
        AnswerSubmissionRequest request = new AnswerSubmissionRequest();
        setField(request, "exerciseId", exerciseId);
        setField(request, "answer", answer);
        setField(request, "selectedOptionId", selectedOptionId);
        return request;
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