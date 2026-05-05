package com.henri.lebnani.content;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContentImportRunRepository extends JpaRepository<ContentImportRun, Long> {

    @EntityGraph(attributePaths = {"course", "user"})
    List<ContentImportRun> findByCourseIdOrderByStartedAtDesc(Long courseId);
}