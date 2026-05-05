package com.henri.lebnani.course;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseControllerTest {

    @Mock CourseService courseService;
    @InjectMocks CourseController courseController;

    @Test
    void getCourses_delegates_to_service() {
        List<CourseResponse> responses = List.of();

        when(courseService.getPublishedCourses()).thenReturn(responses);

        List<CourseResponse> result = courseController.getCourses();

        assertThat(result).isEqualTo(responses);
        verify(courseService).getPublishedCourses();
    }

    @Test
    void getUnits_delegates_to_service() {
        List<CourseUnitResponse> responses = List.of();

        when(courseService.getPublishedUnits(1L)).thenReturn(responses);

        List<CourseUnitResponse> result = courseController.getUnits(1L);

        assertThat(result).isEqualTo(responses);
        verify(courseService).getPublishedUnits(1L);
    }

    @Test
    void getLessons_delegates_to_service() {
        List<LessonResponse> responses = List.of();

        when(courseService.getPublishedLessons(2L)).thenReturn(responses);

        List<LessonResponse> result = courseController.getLessons(2L);

        assertThat(result).isEqualTo(responses);
        verify(courseService).getPublishedLessons(2L);
    }
}