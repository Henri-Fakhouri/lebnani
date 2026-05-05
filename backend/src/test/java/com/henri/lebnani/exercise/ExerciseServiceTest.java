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
        Exercise ex1 = mockExercise(1L);
        Exercise ex2 = mockExercise(2L);
        when(exerciseRepository.findByLessonIdAndPublishedTrueOrderByDisplayOrderAsc(5L))
                .thenReturn(List.of(ex1, ex2));

        List<ExerciseResponse> result = exerciseService.getPublishedExercises(5L);

        assertThat(result).hasSize(2);
    }

    private Exercise mockExercise(Long id) {
        Exercise ex = new Exercise();
        ex.setType(ExerciseType.TYPE_ANSWER);
        ex.setPromptFr("Prompt");
        ex.setCorrectAnswer("answer");
        ex.setDisplayOrder(1);
        ex.setPublished(true);
        try {
            var f = Exercise.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(ex, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return ex;
    }
}