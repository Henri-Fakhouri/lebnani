package com.henri.lebnani.progress;

import java.util.List;

public class UnitProgressResponse {

    private final Long unitId;
    private final String title;
    private final int displayOrder;
    private final int totalLessons;
    private final int completedLessons;
    private final int completionPercent;
    private final boolean locked;
    private final List<LessonProgressResponse> lessons;

    /** Backward-compatible constructor used by existing tests (locked defaults to false). */
    public UnitProgressResponse(
            Long unitId,
            String title,
            int displayOrder,
            int totalLessons,
            int completedLessons,
            List<LessonProgressResponse> lessons
    ) {
        this(unitId, title, displayOrder, totalLessons, completedLessons, false, lessons);
    }

    public UnitProgressResponse(
            Long unitId,
            String title,
            int displayOrder,
            int totalLessons,
            int completedLessons,
            boolean locked,
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
        this.locked = locked;
        this.lessons = lessons;
    }

    public Long getUnitId() { return unitId; }
    public String getTitle() { return title; }
    public int getDisplayOrder() { return displayOrder; }
    public int getTotalLessons() { return totalLessons; }
    public int getCompletedLessons() { return completedLessons; }
    public int getCompletionPercent() { return completionPercent; }
    public boolean isLocked() { return locked; }
    public List<LessonProgressResponse> getLessons() { return lessons; }
}