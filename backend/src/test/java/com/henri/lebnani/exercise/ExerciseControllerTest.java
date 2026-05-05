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
class ExerciseControllerTest {

    @Mock ExerciseService exerciseService;
    @InjectMocks ExerciseController exerciseController;

    @Test
    void getExercises_delegates_to_service() {
        List<ExerciseResponse> responses = List.of();

        when(exerciseService.getPublishedExercises(1L)).thenReturn(responses);

        List<ExerciseResponse> result = exerciseController.getExercises(1L);

        assertThat(result).isEqualTo(responses);
        verify(exerciseService).getPublishedExercises(1L);
    }
}