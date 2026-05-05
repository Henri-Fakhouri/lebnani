package com.henri.lebnani.attempt;

import com.henri.lebnani.exercise.Exercise;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "exercise_attempt")
public class ExerciseAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_attempt_id", nullable = false)
    private LessonAttempt lessonAttempt;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "submitted_answer", columnDefinition = "TEXT")
    private String submittedAnswer;

    @Column(name = "normalized_answer", columnDefinition = "TEXT")
    private String normalizedAnswer;

    @Column(name = "selected_option_id")
    private Long selectedOptionId;

    @Column(nullable = false)
    private boolean correct;

    @Column(name = "answered_at", nullable = false)
    private Instant answeredAt = Instant.now();

    public Long getId() {
        return id;
    }

    public LessonAttempt getLessonAttempt() {
        return lessonAttempt;
    }

    public void setLessonAttempt(LessonAttempt lessonAttempt) {
        this.lessonAttempt = lessonAttempt;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public String getSubmittedAnswer() {
        return submittedAnswer;
    }

    public void setSubmittedAnswer(String submittedAnswer) {
        this.submittedAnswer = submittedAnswer;
    }

    public String getNormalizedAnswer() {
        return normalizedAnswer;
    }

    public void setNormalizedAnswer(String normalizedAnswer) {
        this.normalizedAnswer = normalizedAnswer;
    }

    public Long getSelectedOptionId() {
        return selectedOptionId;
    }

    public void setSelectedOptionId(Long selectedOptionId) {
        this.selectedOptionId = selectedOptionId;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public Instant getAnsweredAt() {
        return answeredAt;
    }
}