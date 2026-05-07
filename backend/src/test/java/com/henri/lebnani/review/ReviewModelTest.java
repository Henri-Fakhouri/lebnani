package com.henri.lebnani.review;

import com.henri.lebnani.attempt.ExerciseAttempt;
import com.henri.lebnani.course.Course;
import com.henri.lebnani.course.CourseUnit;
import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.exercise.ExerciseType;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@SuppressWarnings("null")
class ReviewModelTest {

    @Test
    void reviewItem_createForWrongAnswer_initializes_item() {
        User user = buildUser(1L);
        Exercise exercise = buildExerciseWithLessonContext();
        ExerciseAttempt attempt = new ExerciseAttempt();

        ReviewItem item = new ReviewItem();
        item.createForWrongAnswer(user, exercise, attempt);

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
    void reviewItem_registerFailure_keeps_item_due_and_increments_failure_count() {
        User user = buildUser(1L);
        Exercise exercise = buildExerciseWithLessonContext();

        ReviewItem item = new ReviewItem();
        item.createForWrongAnswer(user, exercise, new ExerciseAttempt());

        item.registerFailure(new ExerciseAttempt());

        assertThat(item.getStatus()).isEqualTo(ReviewItemStatus.DUE);
        assertThat(item.getFailureCount()).isEqualTo(2);
        assertThat(item.getSuccessCount()).isZero();
        assertThat(item.getNextReviewAt()).isNotNull();
        assertThat(item.getUpdatedAt()).isNotNull();
    }

    @Test
    void reviewItem_registerCorrectAnswer_schedules_item_after_one_success() {
        User user = buildUser(1L);
        Exercise exercise = buildExerciseWithLessonContext();

        ReviewItem item = new ReviewItem();
        item.createForWrongAnswer(user, exercise, new ExerciseAttempt());

        Instant previousNextReviewAt = item.getNextReviewAt();

        item.registerReviewAnswer(true);

        assertThat(item.getStatus()).isEqualTo(ReviewItemStatus.SCHEDULED);
        assertThat(item.getFailureCount()).isEqualTo(1);
        assertThat(item.getSuccessCount()).isEqualTo(1);
        assertThat(item.getNextReviewAt()).isNotNull();
        assertThat(item.getNextReviewAt()).isAfterOrEqualTo(previousNextReviewAt);
        assertThat(item.getUpdatedAt()).isNotNull();
    }

    @Test
    void reviewItem_registerWrongAnswer_resets_success_count_and_keeps_item_due() {
        User user = buildUser(1L);
        Exercise exercise = buildExerciseWithLessonContext();

        ReviewItem item = new ReviewItem();
        item.createForWrongAnswer(user, exercise, new ExerciseAttempt());
        item.registerReviewAnswer(true);

        item.registerReviewAnswer(false);

        assertThat(item.getStatus()).isEqualTo(ReviewItemStatus.DUE);
        assertThat(item.getFailureCount()).isEqualTo(2);
        assertThat(item.getSuccessCount()).isZero();
        assertThat(item.getNextReviewAt()).isNotNull();
        assertThat(item.getUpdatedAt()).isNotNull();
    }

    @Test
    void reviewItem_registerThreeCorrectAnswers_marks_item_mastered() {
        User user = buildUser(1L);
        Exercise exercise = buildExerciseWithLessonContext();

        ReviewItem item = new ReviewItem();
        item.createForWrongAnswer(user, exercise, new ExerciseAttempt());

        item.registerReviewAnswer(true);
        item.registerReviewAnswer(true);
        item.registerReviewAnswer(true);

        assertThat(item.getStatus()).isEqualTo(ReviewItemStatus.MASTERED);
        assertThat(item.getFailureCount()).isEqualTo(1);
        assertThat(item.getSuccessCount()).isEqualTo(3);
        assertThat(item.getNextReviewAt()).isNotNull();
        assertThat(item.getUpdatedAt()).isNotNull();
    }

    @Test
    void reviewItemStatus_contains_expected_values() {
        assertThat(ReviewItemStatus.DUE.name()).isEqualTo("DUE");
        assertThat(ReviewItemStatus.SCHEDULED.name()).isEqualTo("SCHEDULED");
        assertThat(ReviewItemStatus.MASTERED.name()).isEqualTo("MASTERED");
    }

    @Test
    void reviewAnswerRequest_getter_returns_answer() {
        ReviewAnswerRequest request = new ReviewAnswerRequest();
        setField(request, "answer", "baddi rou7");

        assertThat(request.getAnswer()).isEqualTo("baddi rou7");
    }

    @Test
    void reviewItemResponse_maps_review_item() {
        User user = buildUser(1L);
        Exercise exercise = buildExerciseWithLessonContext();

        ReviewItem item = new ReviewItem();
        setId(item, 5L);
        item.createForWrongAnswer(user, exercise, new ExerciseAttempt());

        ReviewItemResponse response = new ReviewItemResponse(item);

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

    @Test
    void reviewItemResponse_maps_scheduled_item() {
        User user = buildUser(1L);
        Exercise exercise = buildExerciseWithLessonContext();

        ReviewItem item = new ReviewItem();
        setId(item, 5L);
        item.createForWrongAnswer(user, exercise, new ExerciseAttempt());
        item.registerReviewAnswer(true);

        ReviewItemResponse response = new ReviewItemResponse(item);

        assertThat(response.getId()).isEqualTo(5L);
        assertThat(response.getStatus()).isEqualTo("SCHEDULED");
        assertThat(response.getFailureCount()).isEqualTo(1);
        assertThat(response.getSuccessCount()).isEqualTo(1);
        assertThat(response.getUnitId()).isEqualTo(100L);
        assertThat(response.getUnitTitle()).isEqualTo("Unit 1");
    }

    @Test
    void reviewItemResponse_maps_mastered_item() {
        User user = buildUser(1L);
        Exercise exercise = buildExerciseWithLessonContext();

        ReviewItem item = new ReviewItem();
        setId(item, 5L);
        item.createForWrongAnswer(user, exercise, new ExerciseAttempt());
        item.registerReviewAnswer(true);
        item.registerReviewAnswer(true);
        item.registerReviewAnswer(true);

        ReviewItemResponse response = new ReviewItemResponse(item);

        assertThat(response.getId()).isEqualTo(5L);
        assertThat(response.getStatus()).isEqualTo("MASTERED");
        assertThat(response.getFailureCount()).isEqualTo(1);
        assertThat(response.getSuccessCount()).isEqualTo(3);
        assertThat(response.getUnitId()).isEqualTo(100L);
        assertThat(response.getUnitTitle()).isEqualTo("Unit 1");
    }

    private User buildUser(Long id) {
        User user = new User();
        setId(user, id);
        return user;
    }

    private Exercise buildExerciseWithLessonContext() {
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
        setId(exercise, 10L);
        exercise.setLesson(lesson);
        exercise.setType(ExerciseType.TYPE_ANSWER);
        exercise.setPromptFr("Prompt");
        exercise.setCorrectAnswer("Correct answer");
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