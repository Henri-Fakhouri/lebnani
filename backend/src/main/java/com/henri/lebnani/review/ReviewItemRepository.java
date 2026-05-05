package com.henri.lebnani.review;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ReviewItemRepository extends JpaRepository<ReviewItem, Long> {

    Optional<ReviewItem> findByUserIdAndExerciseId(Long userId, Long exerciseId);

    @EntityGraph(attributePaths = {"exercise", "exercise.options"})
    List<ReviewItem> findByUserIdAndStatusAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(
            Long userId,
            ReviewItemStatus status,
            Instant now
    );

    @EntityGraph(attributePaths = {"exercise", "exercise.options"})
    @Query("select r from ReviewItem r where r.id = :id")
    Optional<ReviewItem> findByIdWithExercise(Long id);
}