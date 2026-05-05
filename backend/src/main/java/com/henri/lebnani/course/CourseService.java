package com.henri.lebnani.course;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseUnitRepository courseUnitRepository;
    private final LessonRepository lessonRepository;

    public CourseService(
            CourseRepository courseRepository,
            CourseUnitRepository courseUnitRepository,
            LessonRepository lessonRepository
    ) {
        this.courseRepository = courseRepository;
        this.courseUnitRepository = courseUnitRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getPublishedCourses() {
        return courseRepository.findByPublishedTrueOrderByTitleAsc()
                .stream()
                .map(CourseResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseUnitResponse> getPublishedUnits(Long courseId) {
        return courseUnitRepository.findByCourseIdAndPublishedTrueOrderByDisplayOrderAsc(courseId)
                .stream()
                .map(CourseUnitResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LessonResponse> getPublishedLessons(Long unitId) {
        return lessonRepository.findByUnitIdAndPublishedTrueOrderByDisplayOrderAsc(unitId)
                .stream()
                .map(LessonResponse::new)
                .toList();
    }
}