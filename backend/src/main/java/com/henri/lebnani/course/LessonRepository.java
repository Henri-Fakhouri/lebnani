package com.henri.lebnani.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByUnitIdAndPublishedTrueOrderByDisplayOrderAsc(Long unitId);

    List<Lesson> findByUnitCourseIdAndPublishedTrueOrderByUnitDisplayOrderAscDisplayOrderAsc(Long courseId);
}