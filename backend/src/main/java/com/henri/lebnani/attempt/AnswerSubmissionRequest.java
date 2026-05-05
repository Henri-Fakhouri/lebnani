package com.henri.lebnani.attempt;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AnswerSubmissionRequest {

    @NotNull
    private Long exerciseId;

    @NotBlank
    private String answer;

    public Long getExerciseId() {
        return exerciseId;
    }

    public String getAnswer() {
        return answer;
    }
}