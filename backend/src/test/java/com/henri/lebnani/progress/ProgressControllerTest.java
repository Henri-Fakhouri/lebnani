package com.henri.lebnani.progress;

import com.henri.lebnani.user.User;
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
class ProgressControllerTest {

    @Mock ProgressService progressService;
    @InjectMocks ProgressController progressController;

    @Test
    void getMyProgress_delegates_to_service() {
        User user = new User();
        UserProgressResponse response = new UserProgressResponse(10, 2L, 3, 4);

        when(progressService.getUserProgress(user)).thenReturn(response);

        UserProgressResponse result = progressController.getMyProgress(user);

        assertThat(result).isEqualTo(response);
        verify(progressService).getUserProgress(user);
    }

    @Test
    void getMyCourseProgress_delegates_to_service() {
        User user = new User();
        CourseProgressResponse response = new CourseProgressResponse(
                1L,
                "Arabic",
                0,
                0,
                List.of()
        );

        when(progressService.getCourseProgress(1L, user)).thenReturn(response);

        CourseProgressResponse result = progressController.getMyCourseProgress(1L, user);

        assertThat(result).isEqualTo(response);
        verify(progressService).getCourseProgress(1L, user);
    }
}