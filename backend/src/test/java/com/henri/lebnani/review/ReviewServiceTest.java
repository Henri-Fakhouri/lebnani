package com.henri.lebnani.review;

import com.henri.lebnani.attempt.AnswerNormalizer;
import com.henri.lebnani.attempt.ExerciseAttempt;
import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock ReviewItemRepository reviewItemRepository;
    @Mock AnswerNormalizer answerNormalizer;
    @InjectMocks ReviewService reviewService;

    // ── registerWrongAnswer ──────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    void registerWrongAnswer_creates_new_review_item_when_none_exists() {
        User user = buildUser(1L);
        Exercise exercise = buildExercise(10L);
        ExerciseAttempt attempt = mock(ExerciseAttempt.class);

        when(reviewItemRepository.findByUserIdAndExerciseId(1L, 10L)).thenReturn(Optional.empty());
        when(reviewItemRepository.save(isA(ReviewItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        reviewService.registerWrongAnswer(user, exercise, attempt);

        verify(reviewItemRepository).save(any(ReviewItem.class));
    }

    @Test
    @SuppressWarnings("null")
    void registerWrongAnswer_registers_failure_when_item_exists() {
        User user = buildUser(1L);
        Exercise exercise = buildExercise(10L);
        ExerciseAttempt attempt = mock(ExerciseAttempt.class);

        ReviewItem existing = mock(ReviewItem.class);
        when(existing.getId()).thenReturn(5L);
        when(reviewItemRepository.findByUserIdAndExerciseId(1L, 10L)).thenReturn(Optional.of(existing));
        when(reviewItemRepository.save(isA(ReviewItem.class))).thenReturn(existing);

        reviewService.registerWrongAnswer(user, exercise, attempt);

        verify(existing).registerFailure(attempt);
        verify(reviewItemRepository).save(existing);
    }

    // ── getDueReviewItems ────────────────────────────────────────────────────

    @Test
    void getDueReviewItems_returns_empty_when_none_due() {
        User user = buildUser(1L);
        when(reviewItemRepository
                .findByUserIdAndStatusAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(
                        eq(1L), eq(ReviewItemStatus.DUE), any(Instant.class)))
                .thenReturn(List.of());

        List<ReviewItemResponse> result = reviewService.getDueReviewItems(user);

        assertThat(result).isEmpty();
    }

    // ── answerReviewItem ─────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    void answerReviewItem_correct_answer_returns_response() {
        User user = buildUser(1L);
        Exercise exercise = buildExercise(10L);
        when(exercise.getCorrectAnswer()).thenReturn("baddi rou7");

        ReviewItem item = mock(ReviewItem.class);
        when(item.getUser()).thenReturn(user);
        when(item.getStatus()).thenReturn(ReviewItemStatus.DUE);
        when(item.getExercise()).thenReturn(exercise);
        when(item.getId()).thenReturn(5L);
        when(item.getFailureCount()).thenReturn(0);
        when(item.getSuccessCount()).thenReturn(1);
        when(item.getNextReviewAt()).thenReturn(Instant.now());

        ReviewAnswerRequest request = mock(ReviewAnswerRequest.class);
        when(request.getAnswer()).thenReturn("baddi rou7");

        when(reviewItemRepository.findByIdWithExercise(5L)).thenReturn(Optional.of(item));
        when(answerNormalizer.normalize("baddi rou7")).thenReturn("baddi rou7");
        when(reviewItemRepository.save(isA(ReviewItem.class))).thenReturn(item);

        ReviewAnswerResponse response = reviewService.answerReviewItem(5L, request, user);

        assertThat(response).isNotNull();
        assertThat(response.correct()).isTrue();
    }

    @Test
    void answerReviewItem_throws_when_item_not_found() {
        User user = buildUser(1L);
        ReviewAnswerRequest request = mock(ReviewAnswerRequest.class);
        when(reviewItemRepository.findByIdWithExercise(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.answerReviewItem(99L, request, user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void answerReviewItem_throws_when_item_belongs_to_other_user() {
        User owner = buildUser(1L);
        User other = buildUser(2L);
        ReviewAnswerRequest request = mock(ReviewAnswerRequest.class);
        ReviewItem item = mock(ReviewItem.class);
        when(item.getUser()).thenReturn(owner);
        when(reviewItemRepository.findByIdWithExercise(5L)).thenReturn(Optional.of(item));

        assertThatThrownBy(() -> reviewService.answerReviewItem(5L, request, other))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("does not belong");
    }

    @Test
    void answerReviewItem_throws_when_item_already_mastered() {
        User user = buildUser(1L);
        ReviewAnswerRequest request = mock(ReviewAnswerRequest.class);
        ReviewItem item = mock(ReviewItem.class);
        when(item.getUser()).thenReturn(user);
        when(item.getStatus()).thenReturn(ReviewItemStatus.MASTERED);
        when(reviewItemRepository.findByIdWithExercise(5L)).thenReturn(Optional.of(item));

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

    private Exercise buildExercise(Long id) {
        Exercise exercise = mock(Exercise.class);
        when(exercise.getId()).thenReturn(id);
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