package com.henri.lebnani.content;

import com.henri.lebnani.course.Course;
import com.henri.lebnani.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "content_import_run")
public class ContentImportRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentImportRunStatus status = ContentImportRunStatus.STARTED;

    @Column(name = "units_created", nullable = false)
    private int unitsCreated;

    @Column(name = "lessons_created", nullable = false)
    private int lessonsCreated;

    @Column(name = "exercises_created", nullable = false)
    private int exercisesCreated;

    @Column(name = "options_created", nullable = false)
    private int optionsCreated;

    @Column(name = "accepted_answers_created", nullable = false)
    private int acceptedAnswersCreated;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    public Long getId() {
        return id;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ContentImportRunStatus getStatus() {
        return status;
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

    public String getErrorMessage() {
        return errorMessage;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void markCompleted(ContentImportResponse response) {
        this.status = ContentImportRunStatus.COMPLETED;
        this.unitsCreated = response.getUnitsCreated();
        this.lessonsCreated = response.getLessonsCreated();
        this.exercisesCreated = response.getExercisesCreated();
        this.optionsCreated = response.getOptionsCreated();
        this.acceptedAnswersCreated = response.getAcceptedAnswersCreated();
        this.completedAt = Instant.now();
    }

    public void markFailed(String errorMessage) {
        this.status = ContentImportRunStatus.FAILED;
        this.errorMessage = errorMessage;
        this.completedAt = Instant.now();
    }
}