package com.henri.lebnani.course;

public class LessonResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final int displayOrder;

    public LessonResponse(Lesson lesson) {
        this.id = lesson.getId();
        this.title = lesson.getTitle();
        this.description = lesson.getDescription();
        this.displayOrder = lesson.getDisplayOrder();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}