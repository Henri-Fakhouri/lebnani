package com.henri.lebnani.exercise;

import com.henri.lebnani.course.Lesson;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exercise")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExerciseType type;

    @Column(name = "prompt_fr", nullable = false, columnDefinition = "TEXT")
    private String promptFr;

    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean published;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    private List<ExerciseOption> options = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public ExerciseType getType() {
        return type;
    }

    public String getPromptFr() {
        return promptFr;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public boolean isPublished() {
        return published;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<ExerciseOption> getOptions() {
        return options;
    }
}