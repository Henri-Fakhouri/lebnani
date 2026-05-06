package com.henri.lebnani.content;

public class ContentRestoreResponse {

    private final Long restorePointId;
    private final Long courseId;
    private final int unitsRestored;
    private final int lessonsRestored;

    public ContentRestoreResponse(Long restorePointId, Long courseId, int unitsRestored, int lessonsRestored) {
        this.restorePointId = restorePointId;
        this.courseId = courseId;
        this.unitsRestored = unitsRestored;
        this.lessonsRestored = lessonsRestored;
    }

    public Long getRestorePointId() {
        return restorePointId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public int getUnitsRestored() {
        return unitsRestored;
    }

    public int getLessonsRestored() {
        return lessonsRestored;
    }
}