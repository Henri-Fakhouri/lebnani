package com.henri.lebnani.progress;

import java.util.List;

public class UnitProgressResponse {

    private final Long unitId;
    private final String title;
    private final int displayOrder;
    private final int totalLessons;
    private final int completedLessons;
    private final int completionPercent;
    private final List<LessonProgressResponse> lessons;

    public UnitProgressResponse(
            Long unitId,
            String title,
            int displayOrder,
            int totalLessons,
            int completedLessons,
            List<LessonProgressResponse> lessons
    ) {
        this.unitId = unitId;
        this.title = title;
        this.displayOrder = displayOrder;
        this.totalLessons = totalLessons;
        this.completedLessons = completedLessons;
        this.completionPercent = totalLessons == 0
                ? 0
                : (int) Math.round((completedLessons * 100.0) / totalLessons);
        this.lessons = lessons;
    }

    public Long getUnitId() {
        return unitId;
    }

    public String getTitle() {
        return title;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public int getTotalLessons() {
        return totalLessons;
    }

    public int getCompletedLessons() {
        return completedLessons;
    }

    public int getCompletionPercent() {
        return completionPercent;
    }

    public List<LessonProgressResponse> getLessons() {
        return lessons;
    }
}