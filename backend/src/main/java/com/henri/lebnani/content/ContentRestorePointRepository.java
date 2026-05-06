package com.henri.lebnani.content;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContentRestorePointRepository extends JpaRepository<ContentRestorePoint, Long> {

    Optional<ContentRestorePoint> findFirstByCourseIdAndRestoredFalseOrderByCreatedAtDescIdDesc(Long courseId);
}