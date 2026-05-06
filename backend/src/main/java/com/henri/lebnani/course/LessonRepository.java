package com.henri.lebnani.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByUnitIdAndPublishedTrueOrderByDisplayOrderAsc(Long unitId);

    List<Lesson> findByUnitCourseIdAndPublishedTrueOrderByUnitDisplayOrderAscDisplayOrderAsc(Long courseId);

    List<Lesson> findByUnitCourseId(Long courseId);

    @Query("""
            select lesson
            from Lesson lesson
            where lesson.unit.id in :unitIds
            order by lesson.unit.id asc, lesson.displayOrder asc, lesson.id asc
            """)
    List<Lesson> findByUnitIds(@Param("unitIds") List<Long> unitIds);

    @Query("""
            select lesson
            from Lesson lesson
            where lesson.unit.id in :unitIds
            and lesson.published = true
            order by lesson.unit.displayOrder asc, lesson.displayOrder asc, lesson.id asc
            """)
    List<Lesson> findPublishedByUnitIds(@Param("unitIds") List<Long> unitIds);
}