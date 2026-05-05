package com.henri.lebnani.attempt;

import com.henri.lebnani.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class LessonAttemptController {

    private final LessonAttemptService lessonAttemptService;

    public LessonAttemptController(LessonAttemptService lessonAttemptService) {
        this.lessonAttemptService = lessonAttemptService;
    }

    @PostMapping("/lessons/{lessonId}/attempts")
    @ResponseStatus(HttpStatus.CREATED)
    public StartLessonAttemptResponse startAttempt(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal User user
    ) {
        return lessonAttemptService.startAttempt(lessonId, user);
    }

    @PostMapping("/lesson-attempts/{attemptId}/answers")
    public AnswerSubmissionResponse submitAnswer(
            @PathVariable Long attemptId,
            @Valid @RequestBody AnswerSubmissionRequest request,
            @AuthenticationPrincipal User user
    ) {
        return lessonAttemptService.submitAnswer(attemptId, request, user);
    }

    @PostMapping("/lesson-attempts/{attemptId}/complete")
    public CompleteLessonAttemptResponse completeAttempt(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal User user
    ) {
        return lessonAttemptService.completeAttempt(attemptId, user);
    }
}