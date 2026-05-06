package com.henri.lebnani.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseUnitRepository extends JpaRepository<CourseUnit, Long> {

    List<CourseUnit> findByCourseIdAndPublishedTrueOrderByDisplayOrderAsc(Long courseId);

    List<CourseUnit> findByCourseIdOrderByIdAsc(Long courseId);

    @Query("""
            select unit
            from CourseUnit unit
            where unit.course.id = :courseId
            and unit.displayOrder in :displayOrders
            order by unit.id asc
            """)
    List<CourseUnit> findByCourseIdAndDisplayOrderIn(
            @Param("courseId") Long courseId,
            @Param("displayOrders") List<Integer> displayOrders
    );

    @Query("""
            select unit
            from CourseUnit unit
            where unit.course.id = :courseId
            and unit.published = true
            and unit.displayOrder in :displayOrders
            order by unit.displayOrder asc, unit.id asc
            """)
    List<CourseUnit> findPublishedByCourseIdAndDisplayOrderIn(
            @Param("courseId") Long courseId,
            @Param("displayOrders") List<Integer> displayOrders
    );
}