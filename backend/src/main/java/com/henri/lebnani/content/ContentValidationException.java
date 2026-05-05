package com.henri.lebnani.content;

import java.util.List;

public class ContentValidationException extends RuntimeException {

    private final transient List<ContentValidationError> errors;

    public ContentValidationException(List<ContentValidationError> errors) {
        super("Content import validation failed.");
        this.errors = errors;
    }

    public List<ContentValidationError> getErrors() {
        return errors;
    }
}