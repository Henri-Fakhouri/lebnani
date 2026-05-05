package com.henri.lebnani.exercise;

import jakarta.persistence.*;

@Entity
@Table(name = "exercise_option")
public class ExerciseOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "text_value", nullable = false, columnDefinition = "TEXT")
    private String textValue;

    @Column(nullable = false)
    private boolean correct;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    public Long getId() {
        return id;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public String getTextValue() {
        return textValue;
    }

    public boolean isCorrect() {
        return correct;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}