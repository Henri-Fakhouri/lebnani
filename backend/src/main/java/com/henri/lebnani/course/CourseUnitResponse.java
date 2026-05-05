package com.henri.lebnani.course;

public class CourseUnitResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final int displayOrder;

    public CourseUnitResponse(CourseUnit unit) {
        this.id = unit.getId();
        this.title = unit.getTitle();
        this.description = unit.getDescription();
        this.displayOrder = unit.getDisplayOrder();
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