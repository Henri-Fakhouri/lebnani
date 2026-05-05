package com.henri.lebnani.exercise;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional(readOnly = true)
    public List<ExerciseResponse> getPublishedExercises(Long lessonId) {
        return exerciseRepository.findByLessonIdAndPublishedTrueOrderByDisplayOrderAsc(lessonId)
                .stream()
                .map(ExerciseResponse::new)
                .toList();
    }
}