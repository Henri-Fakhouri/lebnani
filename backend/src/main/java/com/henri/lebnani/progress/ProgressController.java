package com.henri.lebnani.progress;

import com.henri.lebnani.user.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/progress")
    public UserProgressResponse getMyProgress(@AuthenticationPrincipal User user) {
        return progressService.getUserProgress(user);
    }

    @GetMapping("/courses/{courseId}/progress")
    public CourseProgressResponse getMyCourseProgress(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user
    ) {
        return progressService.getCourseProgress(courseId, user);
    }
}