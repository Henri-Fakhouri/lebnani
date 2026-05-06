package com.henri.lebnani.progress;

public class LessonProgressResponse {

    private final Long lessonId;
    private final String title;
    private final int displayOrder;
    private final boolean completed;
    private final int bestScorePercent;
    private final int contentBlockCount;
    private final int exerciseCount;
    private final String lessonMode;

    public LessonProgressResponse(
            Long lessonId,
            String title,
            int displayOrder,
            boolean completed,
            int bestScorePercent
    ) {
        this(
                lessonId,
                title,
                displayOrder,
                completed,
                bestScorePercent,
                0,
                0
        );
    }

    public LessonProgressResponse(
            Long lessonId,
            String title,
            int displayOrder,
            boolean completed,
            int bestScorePercent,
            int contentBlockCount,
            int exerciseCount
    ) {
        this.lessonId = lessonId;
        this.title = title;
        this.displayOrder = displayOrder;
        this.completed = completed;
        this.bestScorePercent = bestScorePercent;
        this.contentBlockCount = contentBlockCount;
        this.exerciseCount = exerciseCount;
        this.lessonMode = resolveLessonMode(contentBlockCount, exerciseCount);
    }

    private String resolveLessonMode(int contentBlockCount, int exerciseCount) {
        if (contentBlockCount > 0 && exerciseCount > 0) {
            return "COURSE_AND_EXERCISE";
        }

        if (contentBlockCount > 0) {
            return "COURSE_ONLY";
        }

        if (exerciseCount > 0) {
            return "PRACTICE_ONLY";
        }

        return "EMPTY";
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

    public int getContentBlockCount() {
        return contentBlockCount;
    }

    public int getExerciseCount() {
        return exerciseCount;
    }

    public String getLessonMode() {
        return lessonMode;
    }
}