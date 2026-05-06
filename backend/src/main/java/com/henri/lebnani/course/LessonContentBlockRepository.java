package com.henri.lebnani.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonContentBlockRepository extends JpaRepository<LessonContentBlock, Long> {

    List<LessonContentBlock> findByLessonIdOrderByDisplayOrderAsc(Long lessonId);

    long countByLessonId(Long lessonId);
}