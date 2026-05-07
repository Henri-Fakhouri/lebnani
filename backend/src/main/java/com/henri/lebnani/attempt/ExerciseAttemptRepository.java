package com.henri.lebnani.attempt;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseAttemptRepository extends JpaRepository<ExerciseAttempt, Long> {

    long countByLessonAttemptId(Long lessonAttemptId);

    long countByLessonAttemptIdAndCorrectTrue(Long lessonAttemptId);

    boolean existsByLessonAttemptIdAndExerciseId(Long lessonAttemptId, Long exerciseId);

    @EntityGraph(attributePaths = {"exercise"})
    List<ExerciseAttempt> findByLessonAttemptIdAndCorrectFalse(Long lessonAttemptId);
}