package com.henri.lebnani.review;

import com.henri.lebnani.user.User;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/me")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /** Overload used by existing tests – no unit filter. */
    public List<ReviewItemResponse> getReviewQueue(@AuthenticationPrincipal User user) {
        return reviewService.getDueReviewItems(user);
    }

    @GetMapping("/review-queue")
    public List<ReviewItemResponse> getReviewQueue(
            @RequestParam(required = false) Long unitId,
            @AuthenticationPrincipal User user
    ) {
        return reviewService.getDueReviewItems(user, unitId);
    }

    @GetMapping("/difficult-items")
    public List<ReviewItemResponse> getDifficultItems(@AuthenticationPrincipal User user) {
        return reviewService.getDifficultItems(user);
    }

    @PostMapping("/review-items/{reviewItemId}/answer")
    public ReviewAnswerResponse answerReviewItem(
            @PathVariable Long reviewItemId,
            @Valid @RequestBody ReviewAnswerRequest request,
            @AuthenticationPrincipal User user
    ) {
        return reviewService.answerReviewItem(reviewItemId, request, user);
    }
}