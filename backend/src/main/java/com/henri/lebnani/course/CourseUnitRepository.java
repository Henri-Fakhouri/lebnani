package com.henri.lebnani.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseUnitRepository extends JpaRepository<CourseUnit, Long> {

    List<CourseUnit> findByCourseIdAndPublishedTrueOrderByDisplayOrderAsc(Long courseId);
}