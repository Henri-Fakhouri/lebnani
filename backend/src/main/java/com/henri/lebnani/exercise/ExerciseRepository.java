package com.henri.lebnani.exercise;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    @EntityGraph(attributePaths = "options")
    List<Exercise> findByLessonIdAndPublishedTrueOrderByDisplayOrderAsc(Long lessonId);
}