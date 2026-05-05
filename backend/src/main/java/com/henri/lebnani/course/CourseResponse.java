package com.henri.lebnani.course;

public class CourseResponse {

    private final Long id;
    private final String code;
    private final String title;
    private final String description;
    private final String sourceLanguage;
    private final String targetLanguage;

    public CourseResponse(Course course) {
        this.id = course.getId();
        this.code = course.getCode();
        this.title = course.getTitle();
        this.description = course.getDescription();
        this.sourceLanguage = course.getSourceLanguage();
        this.targetLanguage = course.getTargetLanguage();
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getSourceLanguage() {
        return sourceLanguage;
    }

    public String getTargetLanguage() {
        return targetLanguage;
    }
}