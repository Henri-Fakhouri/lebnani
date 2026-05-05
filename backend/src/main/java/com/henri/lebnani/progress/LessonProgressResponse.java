package com.henri.lebnani.progress;

public class LessonProgressResponse {

    private final Long lessonId;
    private final String title;
    private final int displayOrder;
    private final boolean completed;
    private final int bestScorePercent;

    public LessonProgressResponse(
            Long lessonId,
            String title,
            int displayOrder,
            boolean completed,
            int bestScorePercent
    ) {
        this.lessonId = lessonId;
        this.title = title;
        this.displayOrder = displayOrder;
        this.completed = completed;
        this.bestScorePercent = bestScorePercent;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public String getTitle() {
        return title;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public boolean isCompleted() {
        return completed;
    }

    public int getBestScorePercent() {
        return bestScorePercent;
    }
}