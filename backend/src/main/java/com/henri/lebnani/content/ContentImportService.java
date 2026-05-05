package com.henri.lebnani.content;

import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.course.Course;
import com.henri.lebnani.course.CourseRepository;
import com.henri.lebnani.course.CourseUnit;
import com.henri.lebnani.course.CourseUnitRepository;
import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.course.LessonContentBlock;
import com.henri.lebnani.course.LessonContentBlockRepository;
import com.henri.lebnani.course.LessonContentBlockType;
import com.henri.lebnani.course.LessonRepository;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.exercise.ExerciseAcceptedAnswer;
import com.henri.lebnani.exercise.ExerciseAcceptedAnswerRepository;
import com.henri.lebnani.exercise.ExerciseOption;
import com.henri.lebnani.exercise.ExerciseOptionRepository;
import com.henri.lebnani.exercise.ExerciseRepository;
import com.henri.lebnani.exercise.ExerciseType;
import com.henri.lebnani.user.Role;
import com.henri.lebnani.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class ContentImportService {

    private final CourseRepository courseRepository;
    private final CourseUnitRepository courseUnitRepository;
    private final LessonRepository lessonRepository;
    private final LessonContentBlockRepository lessonContentBlockRepository;
    private final ExerciseRepository exerciseRepository;
    private final ExerciseOptionRepository exerciseOptionRepository;
    private final ExerciseAcceptedAnswerRepository acceptedAnswerRepository;
    private final ContentImportValidator contentImportValidator;
    private final ContentImportRunRepository contentImportRunRepository;

    public ContentImportService(
            CourseRepository courseRepository,
            CourseUnitRepository courseUnitRepository,
            LessonRepository lessonRepository,
            LessonContentBlockRepository lessonContentBlockRepository,
            ExerciseRepository exerciseRepository,
            ExerciseOptionRepository exerciseOptionRepository,
            ExerciseAcceptedAnswerRepository acceptedAnswerRepository,
            ContentImportValidator contentImportValidator,
            ContentImportRunRepository contentImportRunRepository
    ) {
        this.courseRepository = courseRepository;
        this.courseUnitRepository = courseUnitRepository;
        this.lessonRepository = lessonRepository;
        this.lessonContentBlockRepository = lessonContentBlockRepository;
        this.exerciseRepository = exerciseRepository;
        this.exerciseOptionRepository = exerciseOptionRepository;
        this.acceptedAnswerRepository = acceptedAnswerRepository;
        this.contentImportValidator = contentImportValidator;
        this.contentImportRunRepository = contentImportRunRepository;
    }

    @Transactional
    public ContentImportResponse importContent(Long courseId, ContentImportRequest request, User user) {
        validateImportRole(user);

        Course course = courseRepository.findById(Objects.requireNonNull(courseId))
                .orElseThrow(() -> new BusinessException("COURSE_NOT_FOUND", "Course not found."));

        ContentImportRun savedRun = createImportRun(course, user);
        Long importRunId = Objects.requireNonNull(savedRun.getId(), "Import run ID should not be null after save.");

        try {
            contentImportValidator.validate(request);

            ContentImportResponse response = doImport(course, importRunId, request);
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
        validateInspectRole(user);

        return contentImportRunRepository.findByCourseIdOrderByStartedAtDesc(courseId)
                .stream()
                .map(ContentImportRunResponse::new)
                .toList();
    }

    private ContentImportResponse doImport(Course course, Long importRunId, ContentImportRequest request) {
        ImportCounter counter = new ImportCounter();

        for (ContentImportRequest.UnitImport unitImport : request.getUnits()) {
            CourseUnit savedUnit = createUnit(course, unitImport);
            counter.incrementUnitsCreated();

            importLessons(savedUnit, unitImport, counter);
        }

        return new ContentImportResponse(
                importRunId,
                course.getId(),
                counter.toCounts()
        );
    }

    private void importLessons(
            CourseUnit savedUnit,
            ContentImportRequest.UnitImport unitImport,
            ImportCounter counter
    ) {
        for (ContentImportRequest.LessonImport lessonImport : unitImport.getLessons()) {
            Lesson savedLesson = createLesson(savedUnit, lessonImport);
            counter.incrementLessonsCreated();

            importContentBlocks(savedLesson, lessonImport, counter);
            importExercises(savedLesson, lessonImport, counter);
        }
    }

    private void importContentBlocks(
            Lesson savedLesson,
            ContentImportRequest.LessonImport lessonImport,
            ImportCounter counter
    ) {
        for (ContentImportRequest.ContentBlockImport blockImport : lessonImport.getContentBlocks()) {
            LessonContentBlock block = new LessonContentBlock();
            block.setLesson(savedLesson);
            block.setType(parseContentBlockType(blockImport.getType()));
            block.setContent(blockImport.getContent());
            block.setDisplayOrder(blockImport.getDisplayOrder());

            lessonContentBlockRepository.save(block);
            counter.incrementContentBlocksCreated();
        }
    }

    private void importExercises(
            Lesson savedLesson,
            ContentImportRequest.LessonImport lessonImport,
            ImportCounter counter
    ) {
        for (ContentImportRequest.ExerciseImport exerciseImport : lessonImport.getExercises()) {
            Exercise savedExercise = createExercise(savedLesson, exerciseImport);
            counter.incrementExercisesCreated();

            importOptions(savedExercise, exerciseImport, counter);
            importAcceptedAnswers(savedExercise, exerciseImport, counter);
        }
    }

    private void importOptions(
            Exercise savedExercise,
            ContentImportRequest.ExerciseImport exerciseImport,
            ImportCounter counter
    ) {
        for (ContentImportRequest.OptionImport optionImport : exerciseImport.getOptions()) {
            ExerciseOption option = new ExerciseOption();
            option.setExercise(savedExercise);
            option.setTextValue(optionImport.getText());
            option.setCorrect(optionImport.getCorrect());
            option.setDisplayOrder(optionImport.getDisplayOrder());

            exerciseOptionRepository.save(option);
            counter.incrementOptionsCreated();
        }
    }

    private void importAcceptedAnswers(
            Exercise savedExercise,
            ContentImportRequest.ExerciseImport exerciseImport,
            ImportCounter counter
    ) {
        int acceptedAnswerOrder = 1;

        for (String acceptedAnswerText : exerciseImport.getAcceptedAnswers()) {
            ExerciseAcceptedAnswer acceptedAnswer = new ExerciseAcceptedAnswer();
            acceptedAnswer.setExercise(savedExercise);
            acceptedAnswer.setAnswerText(acceptedAnswerText);
            acceptedAnswer.setDisplayOrder(acceptedAnswerOrder++);

            acceptedAnswerRepository.save(acceptedAnswer);
            counter.incrementAcceptedAnswersCreated();
        }
    }

    private CourseUnit createUnit(Course course, ContentImportRequest.UnitImport unitImport) {
        CourseUnit unit = new CourseUnit();
        unit.setCourse(course);
        unit.setTitle(unitImport.getTitle());
        unit.setDescription(unitImport.getDescription());
        unit.setDisplayOrder(unitImport.getDisplayOrder());
        unit.setPublished(true);

        return courseUnitRepository.save(unit);
    }

    private Lesson createLesson(CourseUnit savedUnit, ContentImportRequest.LessonImport lessonImport) {
        Lesson lesson = new Lesson();
        lesson.setUnit(savedUnit);
        lesson.setTitle(lessonImport.getTitle());
        lesson.setDescription(lessonImport.getDescription());
        lesson.setDisplayOrder(lessonImport.getDisplayOrder());
        lesson.setPublished(true);

        return lessonRepository.save(lesson);
    }

    private Exercise createExercise(Lesson savedLesson, ContentImportRequest.ExerciseImport exerciseImport) {
        Exercise exercise = new Exercise();
        exercise.setLesson(savedLesson);
        exercise.setType(parseExerciseType(exerciseImport.getType()));
        exercise.setPromptFr(exerciseImport.getPromptFr());
        exercise.setCorrectAnswer(resolveCorrectAnswer(exerciseImport));
        exercise.setDisplayOrder(exerciseImport.getDisplayOrder());
        exercise.setPublished(true);

        return exerciseRepository.save(exercise);
    }

    private ContentImportRun createImportRun(Course course, User user) {
        ContentImportRun run = new ContentImportRun();
        run.setCourse(course);
        run.setUser(user);

        return contentImportRunRepository.save(run);
    }

    private void validateImportRole(User user) {
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.CONTENT_EDITOR) {
            throw new BusinessException("FORBIDDEN_CONTENT_IMPORT", "Only admins or content editors can import content.");
        }
    }

    private void validateInspectRole(User user) {
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.CONTENT_EDITOR) {
            throw new BusinessException("FORBIDDEN_CONTENT_IMPORT", "Only admins or content editors can inspect content imports.");
        }
    }

    private ExerciseType parseExerciseType(String value) {
        try {
            return ExerciseType.valueOf(value.trim().toUpperCase());
        } catch (Exception exception) {
            throw new BusinessException("INVALID_EXERCISE_TYPE", "Invalid exercise type: " + value);
        }
    }

    private LessonContentBlockType parseContentBlockType(String value) {
        try {
            return LessonContentBlockType.valueOf(value.trim().toUpperCase());
        } catch (Exception exception) {
            throw new BusinessException("INVALID_CONTENT_BLOCK_TYPE", "Invalid content block type: " + value);
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

    private static class ImportCounter {

        private int unitsCreated;
        private int lessonsCreated;
        private int contentBlocksCreated;
        private int exercisesCreated;
        private int optionsCreated;
        private int acceptedAnswersCreated;

        void incrementUnitsCreated() {
            unitsCreated++;
        }

        void incrementLessonsCreated() {
            lessonsCreated++;
        }

        void incrementContentBlocksCreated() {
            contentBlocksCreated++;
        }

        void incrementExercisesCreated() {
            exercisesCreated++;
        }

        void incrementOptionsCreated() {
            optionsCreated++;
        }

        void incrementAcceptedAnswersCreated() {
            acceptedAnswersCreated++;
        }

        ContentImportResponse.ImportCounts toCounts() {
            return new ContentImportResponse.ImportCounts(
                    unitsCreated,
                    lessonsCreated,
                    contentBlocksCreated,
                    exercisesCreated,
                    optionsCreated,
                    acceptedAnswersCreated
            );
        }
    }
}