package com.henri.lebnani.course;

import com.henri.lebnani.common.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LessonContentServiceTest {

    @Mock LessonRepository lessonRepository;
    @Mock LessonContentBlockRepository lessonContentBlockRepository;
    @InjectMocks LessonContentService lessonContentService;

    @Test
    void getLessonContent_returns_blocks_for_existing_lesson() {
        when(lessonRepository.existsById(1L)).thenReturn(true);
        when(lessonContentBlockRepository.findByLessonIdOrderByDisplayOrderAsc(1L))
                .thenReturn(List.of());

        List<LessonContentBlockResponse> result = lessonContentService.getLessonContent(1L);

        assertThat(result).isEmpty();
        verify(lessonContentBlockRepository).findByLessonIdOrderByDisplayOrderAsc(1L);
    }

    @Test
    void getLessonContent_throws_when_lesson_not_found() {
        when(lessonRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> lessonContentService.getLessonContent(99L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Lesson not found");
    }
}