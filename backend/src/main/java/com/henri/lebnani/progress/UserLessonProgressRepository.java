package com.henri.lebnani.progress;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, Long> {

    Optional<UserLessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);

    long countByUserIdAndCompletedTrue(Long userId);
}