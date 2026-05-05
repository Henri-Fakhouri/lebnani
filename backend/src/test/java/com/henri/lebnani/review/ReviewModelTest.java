package com.henri.lebnani.review;

import com.henri.lebnani.attempt.ExerciseAttempt;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.exercise.ExerciseOption;
import com.henri.lebnani.exercise.ExerciseOptionResponse;
import com.henri.lebnani.exercise.ExerciseType;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class ReviewModelTest {

    @Test
    void reviewAnswerRequest_exposes_answer() {
        ReviewAnswerRequest request = new ReviewAnswerRequest();
        setField(request, "answer", "baddi rou7");

        assertThat(request.getAnswer()).isEqualTo("baddi rou7");
    }

    @Test
    void reviewAnswerResponse_record_exposes_values() {
        Instant nextReviewAt = Instant.now();

        ReviewAnswerResponse response = new ReviewAnswerResponse(
                1L,
                2L,
                "Submitted",
                "submitted",
                true,
                "expected",
                "SCHEDULED",
                3,
                4,
                nextReviewAt
        );

        assertThat(response.reviewItemId()).isEqualTo(1L);
        assertThat(response.exerciseId()).isEqualTo(2L);
        assertThat(response.submittedAnswer()).isEqualTo("Submitted");
        assertThat(response.normalizedAnswer()).isEqualTo("submitted");
        assertThat(response.correct()).isTrue();
        assertThat(response.expectedAnswer()).isEqualTo("expected");
        assertThat(response.status()).isEqualTo("SCHEDULED");
        assertThat(response.failureCount()).isEqualTo(3);
        assertThat(response.successCount()).isEqualTo(4);
        assertThat(response.nextReviewAt()).isEqualTo(nextReviewAt);
    }

    @Test
    void reviewItem_createForWrongAnswer_initializes_fields() {
        User user = buildUser(1L);
        Exercise exercise = buildExercise(2L);
        ExerciseAttempt attempt = new ExerciseAttempt();

        ReviewItem item = new ReviewItem();
        setId(item, 3L);

        item.createForWrongAnswer(user, exercise, attempt);

        assertThat(item.getId()).isEqualTo(3L);
        assertThat(item.getUser()).isEqualTo(user);
        assertThat(item.getExercise()).isEqualTo(exercise);
        assertThat(item.getSourceExerciseAttempt()).isEqualTo(attempt);
        assertThat(item.getStatus()).isEqualTo(ReviewItemStatus.DUE);
        assertThat(item.getFailureCount()).isEqualTo(1);
        assertThat(item.getSuccessCount()).isZero();
        assertThat(item.getNextReviewAt()).isNotNull();
        assertThat(item.getCreatedAt()).isNotNull();
        assertThat(item.getUpdatedAt()).isNotNull();
    }

    @Test
    void reviewItem_registerFailure_increments_failure_and_resets_success() {
        User user = buildUser(1L);
        Exercise exercise = buildExercise(2L);
        ExerciseAttempt firstAttempt = new ExerciseAttempt();
        ExerciseAttempt secondAttempt = new ExerciseAttempt();

        ReviewItem item = new ReviewItem();
        item.createForWrongAnswer(user, exercise, firstAttempt);
        item.registerReviewAnswer(true);

        item.registerFailure(secondAttempt);

        assertThat(item.getSourceExerciseAttempt()).isEqualTo(secondAttempt);
        assertThat(item.getStatus()).isEqualTo(ReviewItemStatus.DUE);
        assertThat(item.getFailureCount()).isEqualTo(2);
        assertThat(item.getSuccessCount()).isZero();
        assertThat(item.getNextReviewAt()).isNotNull();
        assertThat(item.getUpdatedAt()).isNotNull();
    }

    @Test
    void reviewItem_first_correct_answer_schedules_for_one_day() {
        ReviewItem item = buildDueReviewItem();

        item.registerReviewAnswer(true);

        assertThat(item.getStatus()).isEqualTo(ReviewItemStatus.SCHEDULED);
        assertThat(item.getFailureCount()).isEqualTo(1);
        assertThat(item.getSuccessCount()).isEqualTo(1);
        assertThat(item.getNextReviewAt()).isAfter(Instant.now());
        assertThat(item.getUpdatedAt()).isNotNull();
    }

    @Test
    void reviewItem_second_correct_answer_schedules_for_three_days() {
        ReviewItem item = buildDueReviewItem();

        item.registerReviewAnswer(true);
        item.registerReviewAnswer(true);

        assertThat(item.getStatus()).isEqualTo(ReviewItemStatus.SCHEDULED);
        assertThat(item.getSuccessCount()).isEqualTo(2);
        assertThat(item.getNextReviewAt()).isAfter(Instant.now().plusSeconds(2L * 24 * 60 * 60));
    }

    @Test
    void reviewItem_third_correct_answer_marks_mastered() {
        ReviewItem item = buildDueReviewItem();

        item.registerReviewAnswer(true);
        item.registerReviewAnswer(true);
        item.registerReviewAnswer(true);

        assertThat(item.getStatus()).isEqualTo(ReviewItemStatus.MASTERED);
        assertThat(item.getSuccessCount()).isEqualTo(3);
        assertThat(item.getNextReviewAt()).isAfter(Instant.now().plusSeconds(29L * 24 * 60 * 60));
    }

    @Test
    void reviewItem_wrong_answer_increments_failure_and_resets_success() {
        ReviewItem item = buildDueReviewItem();
        item.registerReviewAnswer(true);

        item.registerReviewAnswer(false);

        assertThat(item.getStatus()).isEqualTo(ReviewItemStatus.DUE);
        assertThat(item.getFailureCount()).isEqualTo(2);
        assertThat(item.getSuccessCount()).isZero();
        assertThat(item.getNextReviewAt()).isNotNull();
    }

    @Test
    void reviewItemResponse_maps_review_item() {
        User user = buildUser(1L);
        Exercise exercise = buildExercise(2L);

        ExerciseOption option = new ExerciseOption();
        setId(option, 10L);
        option.setExercise(exercise);
        option.setTextValue("Ana");
        option.setDisplayOrder(1);

        exercise.getOptions().add(option);

        ReviewItem item = new ReviewItem();
        setId(item, 3L);
        item.createForWrongAnswer(user, exercise, new ExerciseAttempt());

        ReviewItemResponse response = new ReviewItemResponse(item);

        assertThat(response.getId()).isEqualTo(3L);
        assertThat(response.getExerciseId()).isEqualTo(2L);
        assertThat(response.getExerciseType()).isEqualTo("TYPE_ANSWER");
        assertThat(response.getPromptFr()).isEqualTo("Prompt");
        assertThat(response.getOptions()).hasSize(1);
        assertThat(response.getOptions())
                .extracting(ExerciseOptionResponse::getText)
                .containsExactly("Ana");
        assertThat(response.getStatus()).isEqualTo("DUE");
        assertThat(response.getFailureCount()).isEqualTo(1);
        assertThat(response.getSuccessCount()).isZero();
        assertThat(response.getNextReviewAt()).isNotNull();
    }

    @Test
    void reviewItemStatus_values_are_available() {
        assertThat(ReviewItemStatus.valueOf("DUE")).isEqualTo(ReviewItemStatus.DUE);
        assertThat(ReviewItemStatus.valueOf("SCHEDULED")).isEqualTo(ReviewItemStatus.SCHEDULED);
        assertThat(ReviewItemStatus.valueOf("MASTERED")).isEqualTo(ReviewItemStatus.MASTERED);
    }

    private ReviewItem buildDueReviewItem() {
        ReviewItem item = new ReviewItem();
        item.createForWrongAnswer(buildUser(1L), buildExercise(2L), new ExerciseAttempt());
        return item;
    }

    private User buildUser(Long id) {
        User user = new User();
        setId(user, id);
        return user;
    }

    private Exercise buildExercise(Long id) {
        Exercise exercise = new Exercise();
        setId(exercise, id);
        exercise.setType(ExerciseType.TYPE_ANSWER);
        exercise.setPromptFr("Prompt");
        exercise.setCorrectAnswer("baddi rou7");
        exercise.setDisplayOrder(1);
        exercise.setPublished(true);
        return exercise;
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