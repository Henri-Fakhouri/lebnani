package com.henri.lebnani.course;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonContentController {

    private final LessonContentService lessonContentService;

    public LessonContentController(LessonContentService lessonContentService) {
        this.lessonContentService = lessonContentService;
    }

    @GetMapping("/{lessonId}/content")
    public List<LessonContentBlockResponse> getLessonContent(@PathVariable Long lessonId) {
        return lessonContentService.getLessonContent(lessonId);
    }

    @GetMapping("/{lessonId}/next-lesson")
    public ResponseEntity<NextLessonResponse> getNextLesson(@PathVariable Long lessonId) {
        return lessonContentService.getNextLesson(lessonId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}