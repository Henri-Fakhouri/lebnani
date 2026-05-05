package com.henri.lebnani.exercise;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExerciseServiceTest {

    @Mock ExerciseRepository exerciseRepository;
    @InjectMocks ExerciseService exerciseService;

    @Test
    void getPublishedExercises_returns_empty_list_when_no_exercises() {
        when(exerciseRepository.findByLessonIdAndPublishedTrueOrderByDisplayOrderAsc(1L))
                .thenReturn(List.of());

        List<ExerciseResponse> result = exerciseService.getPublishedExercises(1L);

        assertThat(result).isEmpty();
        verify(exerciseRepository).findByLessonIdAndPublishedTrueOrderByDisplayOrderAsc(1L);
    }

    @Test
    void getPublishedExercises_maps_each_exercise() {
        Exercise exerciseOne = buildExercise(1L, ExerciseType.TYPE_ANSWER, "Translate hello", 1);
        Exercise exerciseTwo = buildExercise(2L, ExerciseType.MULTIPLE_CHOICE, "Choose answer", 2);

        ExerciseOption option = buildOption(10L, exerciseTwo, "Ana", true, 1);
        ExerciseAcceptedAnswer acceptedAnswer = buildAcceptedAnswer(20L, exerciseOne, "marhaba", 1);

        exerciseTwo.getOptions().add(option);
        exerciseOne.getAcceptedAnswers().add(acceptedAnswer);

        when(exerciseRepository.findByLessonIdAndPublishedTrueOrderByDisplayOrderAsc(5L))
                .thenReturn(List.of(exerciseOne, exerciseTwo));

        List<ExerciseResponse> result = exerciseService.getPublishedExercises(5L);

        assertThat(result).hasSize(2);

        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getType()).isEqualTo("TYPE_ANSWER");
        assertThat(result.get(0).getPromptFr()).isEqualTo("Translate hello");
        assertThat(result.get(0).getDisplayOrder()).isEqualTo(1);
        assertThat(result.get(0).getOptions()).isEmpty();
        assertThat(result.get(0).getAcceptedAnswerCount()).isEqualTo(1);

        assertThat(result.get(1).getId()).isEqualTo(2L);
        assertThat(result.get(1).getType()).isEqualTo("MULTIPLE_CHOICE");
        assertThat(result.get(1).getPromptFr()).isEqualTo("Choose answer");
        assertThat(result.get(1).getDisplayOrder()).isEqualTo(2);
        assertThat(result.get(1).getOptions()).hasSize(1);
        assertThat(result.get(1).getOptions().get(0).getId()).isEqualTo(10L);
        assertThat(result.get(1).getOptions().get(0).getText()).isEqualTo("Ana");
        assertThat(result.get(1).getOptions().get(0).getDisplayOrder()).isEqualTo(1);
        assertThat(result.get(1).getAcceptedAnswerCount()).isZero();

        verify(exerciseRepository).findByLessonIdAndPublishedTrueOrderByDisplayOrderAsc(5L);
    }

    private Exercise buildExercise(Long id, ExerciseType type, String promptFr, int displayOrder) {
        Exercise exercise = new Exercise();
        setId(exercise, id);
        exercise.setType(type);
        exercise.setPromptFr(promptFr);
        exercise.setCorrectAnswer("answer");
        exercise.setDisplayOrder(displayOrder);
        exercise.setPublished(true);
        return exercise;
    }

    private ExerciseOption buildOption(
            Long id,
            Exercise exercise,
            String textValue,
            boolean correct,
            int displayOrder
    ) {
        ExerciseOption option = new ExerciseOption();
        setId(option, id);
        option.setExercise(exercise);
        option.setTextValue(textValue);
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