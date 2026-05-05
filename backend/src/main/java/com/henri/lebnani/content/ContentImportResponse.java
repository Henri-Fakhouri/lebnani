package com.henri.lebnani.content;

public class ContentImportResponse {

    private final Long importRunId;
    private final Long courseId;
    private final ImportCounts counts;

    public ContentImportResponse(Long importRunId, Long courseId, ImportCounts counts) {
        this.importRunId = importRunId;
        this.courseId = courseId;
        this.counts = counts;
    }

    public Long getImportRunId() {
        return importRunId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public int getUnitsCreated() {
        return counts.unitsCreated();
    }

    public int getLessonsCreated() {
        return counts.lessonsCreated();
    }

    public int getContentBlocksCreated() {
        return counts.contentBlocksCreated();
    }

    public int getExercisesCreated() {
        return counts.exercisesCreated();
    }

    public int getOptionsCreated() {
        return counts.optionsCreated();
    }

    public int getAcceptedAnswersCreated() {
        return counts.acceptedAnswersCreated();
    }

    public record ImportCounts(
            int unitsCreated,
            int lessonsCreated,
            int contentBlocksCreated,
            int exercisesCreated,
            int optionsCreated,
            int acceptedAnswersCreated
    ) {
    }
}