package com.henri.lebnani.content;

public class ContentValidationError {

    private final String path;
    private final String message;

    public ContentValidationError(String path, String message) {
        this.path = path;
        this.message = message;
    }

    public String getPath() {
        return path;
    }

    public String getMessage() {
        return message;
    }
}