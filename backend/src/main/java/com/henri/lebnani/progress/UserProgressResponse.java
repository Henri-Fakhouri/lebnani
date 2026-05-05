package com.henri.lebnani.progress;

public class UserProgressResponse {

    private final int totalXp;
    private final long completedLessons;

    public UserProgressResponse(int totalXp, long completedLessons) {
        this.totalXp = totalXp;
        this.completedLessons = completedLessons;
    }

    public int getTotalXp() {
        return totalXp;
    }

    public long getCompletedLessons() {
        return completedLessons;
    }
}