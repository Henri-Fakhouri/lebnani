package com.henri.lebnani.course;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/courses")
    public List<CourseResponse> getCourses() {
        return courseService.getPublishedCourses();
    }

    @GetMapping("/courses/{courseId}/units")
    public List<CourseUnitResponse> getUnits(@PathVariable Long courseId) {
        return courseService.getPublishedUnits(courseId);
    }

    @GetMapping("/units/{unitId}/lessons")
    public List<LessonResponse> getLessons(@PathVariable Long unitId) {
        return courseService.getPublishedLessons(unitId);
    }
}