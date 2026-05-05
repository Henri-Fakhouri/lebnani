package com.henri.lebnani.exercise;

public class ExerciseOptionResponse {

    private final Long id;
    private final String text;
    private final int displayOrder;

    public ExerciseOptionResponse(ExerciseOption option) {
        this.id = option.getId();
        this.text = option.getTextValue();
        this.displayOrder = option.getDisplayOrder();
    }

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}