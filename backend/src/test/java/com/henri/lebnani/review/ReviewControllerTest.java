package com.henri.lebnani.review;

import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewControllerTest {

    @Mock ReviewService reviewService;
    @InjectMocks ReviewController reviewController;

    @Test
    void getReviewQueue_delegates_to_service() {
        User user = new User();
        List<ReviewItemResponse> responses = List.of();

        when(reviewService.getDueReviewItems(user)).thenReturn(responses);

        List<ReviewItemResponse> result = reviewController.getReviewQueue(user);

        assertThat(result).isEqualTo(responses);
        verify(reviewService).getDueReviewItems(user);
    }

    @Test
    void answerReviewItem_delegates_to_service() {
        User user = new User();
        ReviewAnswerRequest request = new ReviewAnswerRequest();
        ReviewAnswerResponse response = new ReviewAnswerResponse(
                1L,
                2L,
                "answer",
                "answer",
                true,
                "answer",
                "SCHEDULED",
                0,
                1,
                Instant.now()
        );

        when(reviewService.answerReviewItem(1L, request, user)).thenReturn(response);

        ReviewAnswerResponse result = reviewController.answerReviewItem(1L, request, user);

        assertThat(result).isEqualTo(response);
        verify(reviewService).answerReviewItem(1L, request, user);
    }
}