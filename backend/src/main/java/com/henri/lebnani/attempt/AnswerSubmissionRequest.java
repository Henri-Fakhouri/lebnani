package com.henri.lebnani.attempt;

import jakarta.validation.constraints.NotNull;

public class AnswerSubmissionRequest {

    @NotNull
    private Long exerciseId;

    private String answer;

    private Long selectedOptionId;

    public Long getExerciseId() {
        return exerciseId;
    }

    public String getAnswer() {
        return answer;
    }

    public Long getSelectedOptionId() {
        return selectedOptionId;
    }
}