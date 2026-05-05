package com.henri.lebnani.review;

import jakarta.validation.constraints.NotBlank;

public class ReviewAnswerRequest {

    @NotBlank
    private String answer;

    public String getAnswer() {
        return answer;
    }
}