package com.henri.lebnani.exercise;

import java.util.List;

public class ExerciseResponse {

    private final Long id;
    private final String type;
    private final String promptFr;
    private final int displayOrder;
    private final List<ExerciseOptionResponse> options;

    public ExerciseResponse(Exercise exercise) {
        this.id = exercise.getId();
        this.type = exercise.getType().name();
        this.promptFr = exercise.getPromptFr();
        this.displayOrder = exercise.getDisplayOrder();
        this.options = exercise.getOptions()
                .stream()
                .map(ExerciseOptionResponse::new)
                .toList();
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getPromptFr() {
        return promptFr;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public List<ExerciseOptionResponse> getOptions() {
        return options;
    }
}