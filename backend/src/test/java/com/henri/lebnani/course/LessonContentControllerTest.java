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
class LessonContentControllerTest {

    @Mock LessonContentService lessonContentService;
    @InjectMocks LessonContentController lessonContentController;

    @Test
    void getLessonContent_delegates_to_service() {
        List<LessonContentBlockResponse> responses = List.of();

        when(lessonContentService.getLessonContent(1L)).thenReturn(responses);

        List<LessonContentBlockResponse> result = lessonContentController.getLessonContent(1L);

        assertThat(result).isEqualTo(responses);
        verify(lessonContentService).getLessonContent(1L);
    }
}