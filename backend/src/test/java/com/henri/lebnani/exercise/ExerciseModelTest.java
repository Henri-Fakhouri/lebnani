package com.henri.lebnani.exercise;

import com.henri.lebnani.course.Lesson;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ExerciseModelTest {

    @Test
    void exercise_getters_and_setters_work() {
        Lesson lesson = new Lesson();

        Exercise exercise = new Exercise();
        setId(exercise, 1L);

        exercise.setLesson(lesson);
        exercise.setType(ExerciseType.MULTIPLE_CHOICE);
        exercise.setPromptFr("Choose the correct answer");
        exercise.setCorrectAnswer("Ana");
        exercise.setDisplayOrder(2);
        exercise.setPublished(true);

        assertThat(exercise.getId()).isEqualTo(1L);
        assertThat(exercise.getLesson()).isEqualTo(lesson);
        assertThat(exercise.getType()).isEqualTo(ExerciseType.MULTIPLE_CHOICE);
        assertThat(exercise.getPromptFr()).isEqualTo("Choose the correct answer");
        assertThat(exercise.getCorrectAnswer()).isEqualTo("Ana");
        assertThat(exercise.getDisplayOrder()).isEqualTo(2);
        assertThat(exercise.isPublished()).isTrue();
        assertThat(exercise.getCreatedAt()).isNotNull();
        assertThat(exercise.getOptions()).isEmpty();
        assertThat(exercise.getAcceptedAnswers()).isEmpty();
    }

    @Test
    void exerciseOption_getters_and_setters_work() {
        Exercise exercise = new Exercise();

        ExerciseOption option = new ExerciseOption();
        setId(option, 2L);

        option.setExercise(exercise);
        option.setTextValue("Ana");
        option.setCorrect(true);
        option.setDisplayOrder(3);

        assertThat(option.getId()).isEqualTo(2L);
        assertThat(option.getExercise()).isEqualTo(exercise);
        assertThat(option.getTextValue()).isEqualTo("Ana");
        assertThat(option.isCorrect()).isTrue();
        assertThat(option.getDisplayOrder()).isEqualTo(3);
    }

    @Test
    void exerciseAcceptedAnswer_getters_and_setters_work() {
        Exercise exercise = new Exercise();

        ExerciseAcceptedAnswer acceptedAnswer = new ExerciseAcceptedAnswer();
        setId(acceptedAnswer, 3L);

        acceptedAnswer.setExercise(exercise);
        acceptedAnswer.setAnswerText("baddi rou7");
        acceptedAnswer.setDisplayOrder(4);

        assertThat(acceptedAnswer.getId()).isEqualTo(3L);
        assertThat(acceptedAnswer.getExercise()).isEqualTo(exercise);
        assertThat(acceptedAnswer.getAnswerText()).isEqualTo("baddi rou7");
        assertThat(acceptedAnswer.getDisplayOrder()).isEqualTo(4);
    }

    @Test
    void exerciseOptionResponse_maps_option() {
        ExerciseOption option = new ExerciseOption();
        setId(option, 5L);
        option.setTextValue("Ana");
        option.setCorrect(true);
        option.setDisplayOrder(6);

        ExerciseOptionResponse response = new ExerciseOptionResponse(option);

        assertThat(response.getId()).isEqualTo(5L);
        assertThat(response.getText()).isEqualTo("Ana");
        assertThat(response.getDisplayOrder()).isEqualTo(6);
    }

    @Test
    void exerciseResponse_maps_exercise_with_options_and_accepted_answers() {
        Exercise exercise = new Exercise();
        setId(exercise, 7L);
        exercise.setType(ExerciseType.MULTIPLE_CHOICE);
        exercise.setPromptFr("Choose");
        exercise.setCorrectAnswer("Ana");
        exercise.setDisplayOrder(8);

        ExerciseOption optionOne = new ExerciseOption();
        setId(optionOne, 10L);
        optionOne.setExercise(exercise);
        optionOne.setTextValue("Ana");
        optionOne.setCorrect(true);
        optionOne.setDisplayOrder(1);

        ExerciseOption optionTwo = new ExerciseOption();
        setId(optionTwo, 11L);
        optionTwo.setExercise(exercise);
        optionTwo.setTextValue("Enta");
        optionTwo.setCorrect(false);
        optionTwo.setDisplayOrder(2);

        ExerciseAcceptedAnswer acceptedAnswer = new ExerciseAcceptedAnswer();
        setId(acceptedAnswer, 12L);
        acceptedAnswer.setExercise(exercise);
        acceptedAnswer.setAnswerText("ana");
        acceptedAnswer.setDisplayOrder(1);

        exercise.getOptions().add(optionOne);
        exercise.getOptions().add(optionTwo);
        exercise.getAcceptedAnswers().add(acceptedAnswer);

        ExerciseResponse response = new ExerciseResponse(exercise);

        assertThat(response.getId()).isEqualTo(7L);
        assertThat(response.getType()).isEqualTo("MULTIPLE_CHOICE");
        assertThat(response.getPromptFr()).isEqualTo("Choose");
        assertThat(response.getDisplayOrder()).isEqualTo(8);
        assertThat(response.getOptions()).hasSize(2);
        assertThat(response.getOptions())
                .extracting(ExerciseOptionResponse::getText)
                .containsExactly("Ana", "Enta");
        assertThat(response.getAcceptedAnswerCount()).isEqualTo(1);
    }

    @Test
    void exerciseType_values_are_available() {
        assertThat(ExerciseType.valueOf("MULTIPLE_CHOICE")).isEqualTo(ExerciseType.MULTIPLE_CHOICE);
        assertThat(ExerciseType.valueOf("TYPE_ANSWER")).isEqualTo(ExerciseType.TYPE_ANSWER);
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