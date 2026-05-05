package com.henri.lebnani.course;

public class LessonContentBlockResponse {

    private final Long id;
    private final String type;
    private final String content;
    private final int displayOrder;

    public LessonContentBlockResponse(LessonContentBlock block) {
        this.id = block.getId();
        this.type = block.getType().name();
        this.content = block.getContent();
        this.displayOrder = block.getDisplayOrder();
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getContent() {
        return content;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}