package com.henri.lebnani.course;

import com.henri.lebnani.common.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class LessonContentService {

    private final LessonRepository lessonRepository;
    private final LessonContentBlockRepository lessonContentBlockRepository;

    public LessonContentService(
            LessonRepository lessonRepository,
            LessonContentBlockRepository lessonContentBlockRepository) {
        this.lessonRepository = lessonRepository;
        this.lessonContentBlockRepository = lessonContentBlockRepository;
    }

    @Transactional(readOnly = true)
    public List<LessonContentBlockResponse> getLessonContent(Long lessonId) {
        if (!lessonRepository.existsById(Objects.requireNonNull(lessonId))) {
            throw new BusinessException("LESSON_NOT_FOUND", "Lesson not found.");
        }

        return lessonContentBlockRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId)
                .stream()
                .map(LessonContentBlockResponse::new)
                .toList();
    }
}