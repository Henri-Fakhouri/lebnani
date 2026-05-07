package com.henri.lebnani.review;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ReviewItemRepository extends JpaRepository<ReviewItem, Long> {

    Optional<ReviewItem> findByUserIdAndExerciseId(Long userId, Long exerciseId);

    @EntityGraph(attributePaths = {"exercise", "exercise.options", "exercise.lesson", "exercise.lesson.unit"})
    List<ReviewItem> findByUserIdAndStatusAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(
            Long userId,
            ReviewItemStatus status,
            Instant now
    );

    @EntityGraph(attributePaths = {"exercise", "exercise.options", "exercise.lesson", "exercise.lesson.unit"})
    @Query("""
            select r from ReviewItem r
            where r.user.id = :userId
              and r.status = :status
              and r.nextReviewAt <= :now
              and r.exercise.lesson.unit.id = :unitId
            order by r.nextReviewAt asc
            """)
    List<ReviewItem> findByUserIdAndStatusAndNextReviewAtLessThanEqualAndUnitIdOrderByNextReviewAtAsc(
            @Param("userId") Long userId,
            @Param("status") ReviewItemStatus status,
            @Param("now") Instant now,
            @Param("unitId") Long unitId
    );

    @EntityGraph(attributePaths = {"exercise", "exercise.options", "exercise.lesson", "exercise.lesson.unit"})
    @Query("""
            select r from ReviewItem r
            where r.user.id = :userId
              and r.status <> com.henri.lebnani.review.ReviewItemStatus.MASTERED
              and r.failureCount >= :minFailures
            order by r.failureCount desc
            """)
    List<ReviewItem> findDifficultByUserId(
            @Param("userId") Long userId,
            @Param("minFailures") int minFailures
    );

    @EntityGraph(attributePaths = {"exercise", "exercise.options", "exercise.lesson", "exercise.lesson.unit"})
    @Query("select r from ReviewItem r where r.id = :id")
    Optional<ReviewItem> findByIdWithExercise(@Param("id") Long id);
}