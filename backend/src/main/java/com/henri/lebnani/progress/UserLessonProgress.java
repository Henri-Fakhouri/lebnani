package com.henri.lebnani.progress;

import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "user_lesson_progress")
public class UserLessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(nullable = false)
    private boolean completed;

    @Column(name = "best_score_percent", nullable = false)
    private int bestScorePercent;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public void setLesson(Lesson lesson) {
        this.lesson = lesson;
    }

    public boolean isCompleted() {
        return completed;
    }

    public int getBestScorePercent() {
        return bestScorePercent;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void updateCompletion(int scorePercent) {
        this.completed = true;
        this.bestScorePercent = Math.max(this.bestScorePercent, scorePercent);

        if (this.completedAt == null) {
            this.completedAt = Instant.now();
        }

        this.updatedAt = Instant.now();
    }
}