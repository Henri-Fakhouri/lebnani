package com.henri.lebnani.content;

import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.course.*;
import com.henri.lebnani.exercise.*;
import com.henri.lebnani.user.Role;
import com.henri.lebnani.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContentImportService {

    private final CourseRepository courseRepository;
    private final CourseUnitRepository courseUnitRepository;
    private final LessonRepository lessonRepository;
    private final ExerciseRepository exerciseRepository;
    private final ExerciseOptionRepository exerciseOptionRepository;
    private final ExerciseAcceptedAnswerRepository acceptedAnswerRepository;
    private final ContentImportValidator contentImportValidator;
    private final ContentImportRunRepository contentImportRunRepository;

    public ContentImportService(
            CourseRepository courseRepository,
            CourseUnitRepository courseUnitRepository,
            LessonRepository lessonRepository,
            ExerciseRepository exerciseRepository,
            ExerciseOptionRepository exerciseOptionRepository,
            ExerciseAcceptedAnswerRepository acceptedAnswerRepository,
            ContentImportValidator contentImportValidator,
            ContentImportRunRepository contentImportRunRepository
    ) {
        this.courseRepository = courseRepository;
        this.courseUnitRepository = courseUnitRepository;
        this.lessonRepository = lessonRepository;
        this.exerciseRepository = exerciseRepository;
        this.exerciseOptionRepository = exerciseOptionRepository;
        this.acceptedAnswerRepository = acceptedAnswerRepository;
        this.contentImportValidator = contentImportValidator;
        this.contentImportRunRepository = contentImportRunRepository;
    }

    @Transactional
    public ContentImportResponse importContent(Long courseId, ContentImportRequest request, User user) {
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.CONTENT_EDITOR) {
            throw new BusinessException("FORBIDDEN_CONTENT_IMPORT", "Only admins or content editors can import content.");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException("COURSE_NOT_FOUND", "Course not found."));

        ContentImportRun run = new ContentImportRun();
        run.setCourse(course);
        run.setUser(user);
        ContentImportRun savedRun = contentImportRunRepository.save(run);

        try {
            contentImportValidator.validate(request);

            ContentImportResponse response = doImport(course, savedRun.getId(), request);
            savedRun.markCompleted(response);
            contentImportRunRepository.save(savedRun);

            return response;
        } catch (RuntimeException exception) {
            savedRun.markFailed(exception.getMessage());
            contentImportRunRepository.save(savedRun);
            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public List<ContentImportRunResponse> getImportRuns(Long courseId, User user) {
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.CONTENT_EDITOR) {
            throw new BusinessException("FORBIDDEN_CONTENT_IMPORT", "Only admins or content editors can inspect content imports.");
        }

        return contentImportRunRepository.findByCourseIdOrderByStartedAtDesc(courseId)
                .stream()
                .map(ContentImportRunResponse::new)
                .toList();
    }

    private ContentImportResponse doImport(Course course, Long importRunId, ContentImportRequest request) {
        int unitsCreated = 0;
        int lessonsCreated = 0;
        int exercisesCreated = 0;
        int optionsCreated = 0;
        int acceptedAnswersCreated = 0;

        for (ContentImportRequest.UnitImport unitImport : request.getUnits()) {
            CourseUnit unit = new CourseUnit();
            unit.setCourse(course);
            unit.setTitle(unitImport.getTitle());
            unit.setDescription(unitImport.getDescription());
            unit.setDisplayOrder(unitImport.getDisplayOrder());
            unit.setPublished(true);

            CourseUnit savedUnit = courseUnitRepository.save(unit);
            unitsCreated++;

            for (ContentImportRequest.LessonImport lessonImport : unitImport.getLessons()) {
                Lesson lesson = new Lesson();
                lesson.setUnit(savedUnit);
                lesson.setTitle(lessonImport.getTitle());
                lesson.setDescription(lessonImport.getDescription());
                lesson.setDisplayOrder(lessonImport.getDisplayOrder());
                lesson.setPublished(true);

                Lesson savedLesson = lessonRepository.save(lesson);
                lessonsCreated++;

                for (ContentImportRequest.ExerciseImport exerciseImport : lessonImport.getExercises()) {
                    ExerciseType exerciseType = parseExerciseType(exerciseImport.getType());

                    Exercise exercise = new Exercise();
                    exercise.setLesson(savedLesson);
                    exercise.setType(exerciseType);
                    exercise.setPromptFr(exerciseImport.getPromptFr());
                    exercise.setCorrectAnswer(resolveCorrectAnswer(exerciseImport));
                    exercise.setDisplayOrder(exerciseImport.getDisplayOrder());
                    exercise.setPublished(true);

                    Exercise savedExercise = exerciseRepository.save(exercise);
                    exercisesCreated++;

                    for (ContentImportRequest.OptionImport optionImport : exerciseImport.getOptions()) {
                        ExerciseOption option = new ExerciseOption();
                        option.setExercise(savedExercise);
                        option.setTextValue(optionImport.getText());
                        option.setCorrect(optionImport.getCorrect());
                        option.setDisplayOrder(optionImport.getDisplayOrder());

                        exerciseOptionRepository.save(option);
                        optionsCreated++;
                    }

                    int acceptedAnswerOrder = 1;
                    for (String acceptedAnswerText : exerciseImport.getAcceptedAnswers()) {
                        ExerciseAcceptedAnswer acceptedAnswer = new ExerciseAcceptedAnswer();
                        acceptedAnswer.setExercise(savedExercise);
                        acceptedAnswer.setAnswerText(acceptedAnswerText);
                        acceptedAnswer.setDisplayOrder(acceptedAnswerOrder++);

                        acceptedAnswerRepository.save(acceptedAnswer);
                        acceptedAnswersCreated++;
                    }
                }
            }
        }

        return new ContentImportResponse(
                importRunId,
                course.getId(),
                unitsCreated,
                lessonsCreated,
                exercisesCreated,
                optionsCreated,
                acceptedAnswersCreated
        );
    }

    private ExerciseType parseExerciseType(String value) {
        try {
            return ExerciseType.valueOf(value.trim().toUpperCase());
        } catch (Exception exception) {
            throw new BusinessException("INVALID_EXERCISE_TYPE", "Invalid exercise type: " + value);
        }
    }

    private String resolveCorrectAnswer(ContentImportRequest.ExerciseImport exerciseImport) {
        if (exerciseImport.getCorrectAnswer() != null && !exerciseImport.getCorrectAnswer().isBlank()) {
            return exerciseImport.getCorrectAnswer();
        }

        if (!exerciseImport.getAcceptedAnswers().isEmpty()) {
            return exerciseImport.getAcceptedAnswers().get(0);
        }

        return null;
    }
}