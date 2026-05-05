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
class CourseServiceTest {

    @Mock CourseRepository courseRepository;
    @Mock CourseUnitRepository courseUnitRepository;
    @Mock LessonRepository lessonRepository;
    @InjectMocks CourseService courseService;

    @Test
    void getPublishedCourses_delegates_to_repository() {
        when(courseRepository.findByPublishedTrueOrderByTitleAsc()).thenReturn(List.of());

        List<CourseResponse> result = courseService.getPublishedCourses();

        assertThat(result).isEmpty();
        verify(courseRepository).findByPublishedTrueOrderByTitleAsc();
    }

    @Test
    void getPublishedUnits_delegates_to_repository() {
        when(courseUnitRepository.findByCourseIdAndPublishedTrueOrderByDisplayOrderAsc(1L))
                .thenReturn(List.of());

        List<CourseUnitResponse> result = courseService.getPublishedUnits(1L);

        assertThat(result).isEmpty();
        verify(courseUnitRepository).findByCourseIdAndPublishedTrueOrderByDisplayOrderAsc(1L);
    }

    @Test
    void getPublishedLessons_delegates_to_repository() {
        when(lessonRepository.findByUnitIdAndPublishedTrueOrderByDisplayOrderAsc(2L))
                .thenReturn(List.of());

        List<LessonResponse> result = courseService.getPublishedLessons(2L);

        assertThat(result).isEmpty();
        verify(lessonRepository).findByUnitIdAndPublishedTrueOrderByDisplayOrderAsc(2L);
    }
}