package com.henri.lebnani.review;

import com.henri.lebnani.user.User;
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

    @GetMapping("/review-queue")
    public List<ReviewItemResponse> getReviewQueue(@AuthenticationPrincipal User user) {
        return reviewService.getDueReviewItems(user);
    }
}