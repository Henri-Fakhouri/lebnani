package com.henri.lebnani.progress;

public class UserProgressResponse {

    private final int totalXp;
    private final long completedLessons;
    private final int currentStreak;
    private final int longestStreak;

    public UserProgressResponse(
            int totalXp,
            long completedLessons,
            int currentStreak,
            int longestStreak
    ) {
        this.totalXp = totalXp;
        this.completedLessons = completedLessons;
        this.currentStreak = currentStreak;
        this.longestStreak = longestStreak;
    }

    public int getTotalXp() {
        return totalXp;
    }

    public long getCompletedLessons() {
        return completedLessons;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public int getLongestStreak() {
        return longestStreak;
    }
}