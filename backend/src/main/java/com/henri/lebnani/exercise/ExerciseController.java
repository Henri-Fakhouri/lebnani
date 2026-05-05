package com.henri.lebnani.exercise;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping("/lessons/{lessonId}/exercises")
    public List<ExerciseResponse> getExercises(@PathVariable Long lessonId) {
        return exerciseService.getPublishedExercises(lessonId);
    }
}