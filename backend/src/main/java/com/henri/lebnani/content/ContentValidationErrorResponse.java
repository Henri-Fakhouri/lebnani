package com.henri.lebnani.content;

import java.time.Instant;
import java.util.List;

public class ContentValidationErrorResponse {

    private final String code;
    private final String message;
    private final List<ContentValidationError> errors;
    private final Instant timestamp;

    public ContentValidationErrorResponse(List<ContentValidationError> errors) {
        this.code = "CONTENT_VALIDATION_ERROR";
        this.message = "Content import validation failed.";
        this.errors = errors;
        this.timestamp = Instant.now();
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public List<ContentValidationError> getErrors() {
        return errors;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}