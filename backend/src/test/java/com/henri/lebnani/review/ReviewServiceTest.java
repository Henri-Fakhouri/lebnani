package com.henri.lebnani.review;

import com.henri.lebnani.attempt.AnswerNormalizer;
import com.henri.lebnani.attempt.ExerciseAttempt;
import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.course.Course;
import com.henri.lebnani.course.CourseUnit;
import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.exercise.ExerciseType;
import com.henri.lebnani.progress.XpEvent;
import com.henri.lebnani.progress.XpEventRepository;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
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
class ReviewServiceTest {

    @Mock ReviewItemRepository reviewItemRepository;
    @Mock AnswerNormalizer answerNormalizer;
    @Mock XpEventRepository xpEventRepository;

    @InjectMocks ReviewService reviewService;

    // ── registerWrongAnswer ──────────────────────────────────────────────────

    @Test
    void registerWrongAnswer_creates_new_review_item_when_none_exists() {
        User user = buildUser(1L);
        Exercise exercise = buildExercise(10L, "Correct answer");
        ExerciseAttempt attempt = new ExerciseAttempt();

        when(reviewItemRepository.findByUserIdAndExerciseId(1L, 10L))
                .thenReturn(Optional.empty());
        when(reviewItemRepository.save(any(ReviewItem.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        reviewService.registerWrongAnswer(user, exercise, attempt);

        ArgumentCaptor<ReviewItem> captor = ArgumentCaptor.forClass(ReviewItem.class);
        verify(reviewItemRepository).save(captor.capture());

        ReviewItem saved = captor.getValue();

        assertThat(saved.getUser()).isEqualTo(user);
        assertThat(saved.getExercise()).isEqualTo(exercise);
        assertThat(saved.getSourceExerciseAttempt()).isEqualTo(attempt);
        assertThat(saved.getStatus()).isEqualTo(ReviewItemStatus.DUE);
        assertThat(saved.getFailureCount()).isEqualTo(1);
        assertThat(saved.getSuccessCount()).isZero();
        assertThat(saved.getNextReviewAt()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    void registerWrongAnswer_registers_failure_when_item_exists() {
        User user = buildUser(1L);
        Exercise exercise = buildExercise(10L, "Correct answer");
        ExerciseAttempt firstAttempt = new ExerciseAttempt();
        ExerciseAttempt secondAttempt = new ExerciseAttempt();

        ReviewItem existing = new ReviewItem();
        setId(existing, 5L);
        existing.createForWrongAnswer(user, exercise, firstAttempt);

        when(reviewItemRepository.findByUserIdAndExerciseId(1L, 10L))
                .thenReturn(Optional.of(existing));
        when(reviewItemRepository.save(any(ReviewItem.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        reviewService.registerWrongAnswer(user, exercise, secondAttempt);

        assertThat(existing.getSourceExerciseAttempt()).isEqualTo(secondAttempt);
        assertThat(existing.getStatus()).isEqualTo(ReviewItemStatus.DUE);
        assertThat(existing.getFailureCount()).isEqualTo(2);
        assertThat(existing.getSuccessCount()).isZero();

        verify(reviewItemRepository).save(existing);
    }

    // ── getDueReviewItems ────────────────────────────────────────────────────

    @Test
    void getDueReviewItems_returns_empty_when_none_due() {
        User user = buildUser(1L);

        when(reviewItemRepository
                .findByUserIdAndStatusAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(
                        eq(1L),
                        eq(ReviewItemStatus.DUE),
                        any(Instant.class)
                ))
                .thenReturn(List.of());

        List<ReviewItemResponse> result = reviewService.getDueReviewItems(user);

        assertThat(result).isEmpty();
    }

    @Test
    void getDueReviewItems_maps_due_items() {
        User user = buildUser(1L);
        Exercise exercise = buildExercise(10L, "Correct answer");

        ReviewItem item = new ReviewItem();
        setId(item, 5L);
        item.createForWrongAnswer(user, exercise, new ExerciseAttempt());

        when(reviewItemRepository
                .findByUserIdAndStatusAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(
                        eq(1L),
                        eq(ReviewItemStatus.DUE),
                        any(Instant.class)
                ))
                .thenReturn(List.of(item));

        List<ReviewItemResponse> result = reviewService.getDueReviewItems(user);

        assertThat(result).hasSize(1);

        ReviewItemResponse response = result.get(0);

        assertThat(response.getId()).isEqualTo(5L);
        assertThat(response.getExerciseId()).isEqualTo(10L);
        assertThat(response.getExerciseType()).isEqualTo("TYPE_ANSWER");
        assertThat(response.getPromptFr()).isEqualTo("Prompt");
        assertThat(response.getOptions()).isEmpty();
        assertThat(response.getStatus()).isEqualTo("DUE");
        assertThat(response.getFailureCount()).isEqualTo(1);
        assertThat(response.getSuccessCount()).isZero();
        assertThat(response.getNextReviewAt()).isNotNull();
        assertThat(response.getUnitId()).isEqualTo(100L);
        assertThat(response.getUnitTitle()).isEqualTo("Unit 1");
    }

    // ── answerReviewItem ─────────────────────────────────────────────────────

    @Test
    void answerReviewItem_correct_answer_returns_response_schedules_item_and_awards_xp() {
        User user = buildUser(1L);
        Exercise exercise = buildExercise(10L, "baddi rou7");

        ReviewItem item = new ReviewItem();
        setId(item, 5L);
        item.createForWrongAnswer(user, exercise, new ExerciseAttempt());

        ReviewAnswerRequest request = buildReviewAnswerRequest("Baddi Rou7");

        when(reviewItemRepository.findByIdWithExercise(5L))
                .thenReturn(Optional.of(item));
        when(answerNormalizer.normalize("Baddi Rou7"))
                .thenReturn("baddi rou7");
        when(answerNormalizer.normalize("baddi rou7"))
                .thenReturn("baddi rou7");
        when(reviewItemRepository.save(any(ReviewItem.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(xpEventRepository.save(any(XpEvent.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ReviewAnswerResponse response = reviewService.answerReviewItem(5L, request, user);

        assertThat(response.reviewItemId()).isEqualTo(5L);
        assertThat(response.exerciseId()).isEqualTo(10L);
        assertThat(response.submittedAnswer()).isEqualTo("Baddi Rou7");
        assertThat(response.normalizedAnswer()).isEqualTo("baddi rou7");
        assertThat(response.correct()).isTrue();
        assertThat(response.expectedAnswer()).isEqualTo("baddi rou7");
        assertThat(response.status()).isEqualTo("SCHEDULED");
        assertThat(response.failureCount()).isEqualTo(1);
        assertThat(response.successCount()).isEqualTo(1);
        assertThat(response.nextReviewAt()).isNotNull();

        verify(reviewItemRepository).save(item);
        verify(xpEventRepository).save(any(XpEvent.class));
    }

    @Test
    void answerReviewItem_wrong_answer_returns_response_keeps_item_due_and_does_not_award_xp() {
        User user = buildUser(1L);
        Exercise exercise = buildExercise(10L, "baddi rou7");

        ReviewItem item = new ReviewItem();
        setId(item, 5L);
        item.createForWrongAnswer(user, exercise, new ExerciseAttempt());

        ReviewAnswerRequest request = buildReviewAnswerRequest("wrong");

        when(reviewItemRepository.findByIdWithExercise(5L))
                .thenReturn(Optional.of(item));
        when(answerNormalizer.normalize("wrong"))
                .thenReturn("wrong");
        when(answerNormalizer.normalize("baddi rou7"))
                .thenReturn("baddi rou7");
        when(reviewItemRepository.save(any(ReviewItem.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ReviewAnswerResponse response = reviewService.answerReviewItem(5L, request, user);

        assertThat(response.reviewItemId()).isEqualTo(5L);
        assertThat(response.exerciseId()).isEqualTo(10L);
        assertThat(response.submittedAnswer()).isEqualTo("wrong");
        assertThat(response.normalizedAnswer()).isEqualTo("wrong");
        assertThat(response.correct()).isFalse();
        assertThat(response.expectedAnswer()).isEqualTo("baddi rou7");
        assertThat(response.status()).isEqualTo("DUE");
        assertThat(response.failureCount()).isEqualTo(2);
        assertThat(response.successCount()).isZero();
        assertThat(response.nextReviewAt()).isNotNull();

        verify(reviewItemRepository).save(item);
        verify(xpEventRepository, never()).save(any(XpEvent.class));
    }

    @Test
    void answerReviewItem_throws_when_item_not_found() {
        User user = buildUser(1L);
        ReviewAnswerRequest request = buildReviewAnswerRequest("answer");

        when(reviewItemRepository.findByIdWithExercise(99L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.answerReviewItem(99L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void answerReviewItem_throws_when_item_belongs_to_other_user() {
        User owner = buildUser(1L);
        User other = buildUser(2L);
        Exercise exercise = buildExercise(10L, "answer");

        ReviewItem item = new ReviewItem();
        setId(item, 5L);
        item.createForWrongAnswer(owner, exercise, new ExerciseAttempt());

        ReviewAnswerRequest request = buildReviewAnswerRequest("answer");

        when(reviewItemRepository.findByIdWithExercise(5L))
                .thenReturn(Optional.of(item));

        assertThatThrownBy(() -> reviewService.answerReviewItem(5L, request, other))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("does not belong");
    }

    @Test
    void answerReviewItem_throws_when_item_already_mastered() {
        User user = buildUser(1L);
        Exercise exercise = buildExercise(10L, "answer");

        ReviewItem item = new ReviewItem();
        setId(item, 5L);
        item.createForWrongAnswer(user, exercise, new ExerciseAttempt());
        item.registerReviewAnswer(true);
        item.registerReviewAnswer(true);
        item.registerReviewAnswer(true);

        ReviewAnswerRequest request = buildReviewAnswerRequest("answer");

        when(reviewItemRepository.findByIdWithExercise(5L))
                .thenReturn(Optional.of(item));

        assertThatThrownBy(() -> reviewService.answerReviewItem(5L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("mastered");
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private User buildUser(Long id) {
        User user = new User();
        setId(user, id);
        return user;
    }

    private Exercise buildExercise(Long id, String correctAnswer) {
        Course course = new Course();
        setId(course, 1L);
        course.setTitle("Course 1");

        CourseUnit unit = new CourseUnit();
        setId(unit, 100L);
        unit.setCourse(course);
        unit.setTitle("Unit 1");
        unit.setDescription("Unit description");
        unit.setDisplayOrder(1);
        unit.setPublished(true);

        Lesson lesson = new Lesson();
        setId(lesson, 200L);
        lesson.setUnit(unit);
        lesson.setTitle("Lesson 1");
        lesson.setDescription("Lesson description");
        lesson.setDisplayOrder(1);
        lesson.setPublished(true);

        Exercise exercise = new Exercise();
        setId(exercise, id);
        exercise.setLesson(lesson);
        exercise.setType(ExerciseType.TYPE_ANSWER);
        exercise.setPromptFr("Prompt");
        exercise.setCorrectAnswer(correctAnswer);
        exercise.setDisplayOrder(1);
        exercise.setPublished(true);

        return exercise;
    }

    private ReviewAnswerRequest buildReviewAnswerRequest(String answer) {
        ReviewAnswerRequest request = new ReviewAnswerRequest();
        setField(request, "answer", answer);
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