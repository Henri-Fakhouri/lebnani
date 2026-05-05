package com.henri.lebnani.attempt;

import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LessonAttemptControllerTest {

    @Mock LessonAttemptService lessonAttemptService;
    @InjectMocks LessonAttemptController lessonAttemptController;

    @Test
    void startAttempt_delegates_to_service() {
        User user = new User();
        StartLessonAttemptResponse response = new StartLessonAttemptResponse(1L, 2L, "IN_PROGRESS");

        when(lessonAttemptService.startAttempt(2L, user)).thenReturn(response);

        StartLessonAttemptResponse result = lessonAttemptController.startAttempt(2L, user);

        assertThat(result).isEqualTo(response);
        verify(lessonAttemptService).startAttempt(2L, user);
    }

    @Test
    void submitAnswer_delegates_to_service() {
        User user = new User();
        AnswerSubmissionRequest request = new AnswerSubmissionRequest();
        AnswerSubmissionResponse response = new AnswerSubmissionResponse(
                1L,
                2L,
                "answer",
                "answer",
                null,
                true,
                "answer"
        );

        when(lessonAttemptService.submitAnswer(3L, request, user)).thenReturn(response);

        AnswerSubmissionResponse result = lessonAttemptController.submitAnswer(3L, request, user);

        assertThat(result).isEqualTo(response);
        verify(lessonAttemptService).submitAnswer(3L, request, user);
    }

    @Test
    void completeAttempt_delegates_to_service() {
        User user = new User();
        CompleteLessonAttemptResponse response = new CompleteLessonAttemptResponse(
                1L,
                2L,
                "COMPLETED",
                3L,
                3L,
                3L,
                10
        );

        when(lessonAttemptService.completeAttempt(1L, user)).thenReturn(response);

        CompleteLessonAttemptResponse result = lessonAttemptController.completeAttempt(1L, user);

        assertThat(result).isEqualTo(response);
        verify(lessonAttemptService).completeAttempt(1L, user);
    }
}