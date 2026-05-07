package com.henri.lebnani.course;

import com.henri.lebnani.common.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

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

    @Transactional(readOnly = true)
    public Optional<NextLessonResponse> getNextLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(Objects.requireNonNull(lessonId))
                .orElseThrow(() -> new BusinessException("LESSON_NOT_FOUND", "Lesson not found."));

        Long courseId = lesson.getUnit().getCourse().getId();

        List<Lesson> allLessons = lessonRepository
                .findByUnitCourseIdAndPublishedTrueOrderByUnitDisplayOrderAscDisplayOrderAsc(courseId);

        for (int i = 0; i < allLessons.size() - 1; i++) {
            if (allLessons.get(i).getId().equals(lessonId)) {
                Lesson next = allLessons.get(i + 1);
                return Optional.of(new NextLessonResponse(
                        next.getId(),
                        next.getTitle(),
                        next.getUnit().getTitle()));
            }
        }

        return Optional.empty();
    }
}