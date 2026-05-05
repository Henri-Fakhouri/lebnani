package com.henri.lebnani.progress;

import java.util.List;

public class CourseProgressResponse {

    private final Long courseId;
    private final String courseTitle;
    private final int totalLessons;
    private final int completedLessons;
    private final int completionPercent;
    private final List<UnitProgressResponse> units;

    public CourseProgressResponse(
            Long courseId,
            String courseTitle,
            int totalLessons,
            int completedLessons,
            List<UnitProgressResponse> units
    ) {
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.totalLessons = totalLessons;
        this.completedLessons = completedLessons;
        this.completionPercent = totalLessons == 0
                ? 0
                : (int) Math.round((completedLessons * 100.0) / totalLessons);
        this.units = units;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
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

    public List<UnitProgressResponse> getUnits() {
        return units;
    }
}