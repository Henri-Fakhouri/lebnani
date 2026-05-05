package com.henri.lebnani.attempt;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseAttemptRepository extends JpaRepository<ExerciseAttempt, Long> {

    long countByLessonAttemptId(Long lessonAttemptId);

    long countByLessonAttemptIdAndCorrectTrue(Long lessonAttemptId);
}