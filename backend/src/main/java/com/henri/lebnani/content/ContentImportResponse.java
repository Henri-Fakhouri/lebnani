package com.henri.lebnani.content;

public class ContentImportResponse {

    private final Long courseId;
    private final int unitsCreated;
    private final int lessonsCreated;
    private final int exercisesCreated;
    private final int optionsCreated;
    private final int acceptedAnswersCreated;

    public ContentImportResponse(
            Long courseId,
            int unitsCreated,
            int lessonsCreated,
            int exercisesCreated,
            int optionsCreated,
            int acceptedAnswersCreated
    ) {
        this.courseId = courseId;
        this.unitsCreated = unitsCreated;
        this.lessonsCreated = lessonsCreated;
        this.exercisesCreated = exercisesCreated;
        this.optionsCreated = optionsCreated;
        this.acceptedAnswersCreated = acceptedAnswersCreated;
    }

    public Long getCourseId() {
        return courseId;
    }

    public int getUnitsCreated() {
        return unitsCreated;
    }

    public int getLessonsCreated() {
        return lessonsCreated;
    }

    public int getExercisesCreated() {
        return exercisesCreated;
    }

    public int getOptionsCreated() {
        return optionsCreated;
    }

    public int getAcceptedAnswersCreated() {
        return acceptedAnswersCreated;
    }
}