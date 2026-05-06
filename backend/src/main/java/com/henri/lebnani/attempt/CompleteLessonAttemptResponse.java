package com.henri.lebnani.attempt;

public class CompleteLessonAttemptResponse {

    private final Long attemptId;
    private final Long lessonId;
    private final String status;
    private final long totalExercises;
    private final long answeredExercises;
    private final long correctAnswers;
    private final long wrongAnswers;
    private final int scorePercent;
    private final int xpAwarded;

    public CompleteLessonAttemptResponse(
            Long attemptId,
            Long lessonId,
            String status,
            long totalExercises,
            long answeredExercises,
            long correctAnswers,
            int xpAwarded
    ) {
        this.attemptId = attemptId;
        this.lessonId = lessonId;
        this.status = status;
        this.totalExercises = totalExercises;
        this.answeredExercises = answeredExercises;
        this.correctAnswers = correctAnswers;
        this.wrongAnswers = answeredExercises - correctAnswers;
        this.scorePercent = totalExercises == 0
                ? 0
                : (int) Math.round((correctAnswers * 100.0) / totalExercises);
        this.xpAwarded = xpAwarded;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public String getStatus() {
        return status;
    }

    public long getTotalExercises() {
        return totalExercises;
    }

    public long getAnsweredExercises() {
        return answeredExercises;
    }

    public long getCorrectAnswers() {
        return correctAnswers;
    }

    public long getWrongAnswers() {
        return wrongAnswers;
    }

    public int getScorePercent() {
        if (totalExercises == 0) {
            return 100;
        }

        return (int) Math.round((correctAnswers * 100.0) / totalExercises);
    }

    public int getXpAwarded() {
        return xpAwarded;
    }
}