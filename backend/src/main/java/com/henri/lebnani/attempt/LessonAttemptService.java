package com.henri.lebnani.attempt;

import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.course.LessonRepository;
import com.henri.lebnani.exercise.*;
import com.henri.lebnani.progress.ProgressService;
import com.henri.lebnani.review.ReviewService;
import com.henri.lebnani.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LessonAttemptService {

    private final LessonRepository lessonRepository;
    private final ExerciseRepository exerciseRepository;
    private final ExerciseOptionRepository exerciseOptionRepository;
    private final LessonAttemptRepository lessonAttemptRepository;
    private final ExerciseAttemptRepository exerciseAttemptRepository;
    private final AnswerNormalizer answerNormalizer;
    private final ProgressService progressService;
    private final ReviewService reviewService;

    public LessonAttemptService(
            LessonRepository lessonRepository,
            ExerciseRepository exerciseRepository,
            ExerciseOptionRepository exerciseOptionRepository,
            LessonAttemptRepository lessonAttemptRepository,
            ExerciseAttemptRepository exerciseAttemptRepository,
            AnswerNormalizer answerNormalizer,
            ProgressService progressService,
            ReviewService reviewService) {
        this.lessonRepository = lessonRepository;
        this.exerciseRepository = exerciseRepository;
        this.exerciseOptionRepository = exerciseOptionRepository;
        this.lessonAttemptRepository = lessonAttemptRepository;
        this.exerciseAttemptRepository = exerciseAttemptRepository;
        this.answerNormalizer = answerNormalizer;
        this.progressService = progressService;
        this.reviewService = reviewService;
    }

    @Transactional
    public StartLessonAttemptResponse startAttempt(Long lessonId, User user) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new BusinessException("LESSON_NOT_FOUND", "Lesson not found."));

        LessonAttempt attempt = new LessonAttempt();
        attempt.setLesson(lesson);
        attempt.setUser(user);
        attempt.setStatus(LessonAttemptStatus.IN_PROGRESS);

        LessonAttempt savedAttempt = lessonAttemptRepository.save(attempt);

        return new StartLessonAttemptResponse(
                savedAttempt.getId(),
                lesson.getId(),
                savedAttempt.getStatus().name());
    }

    @Transactional
    public AnswerSubmissionResponse submitAnswer(Long attemptId, AnswerSubmissionRequest request, User user) {
        LessonAttempt attempt = lessonAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new BusinessException("ATTEMPT_NOT_FOUND", "Lesson attempt not found."));

        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new BusinessException("ATTEMPT_FORBIDDEN", "This lesson attempt does not belong to you.");
        }

        if (attempt.getStatus() != LessonAttemptStatus.IN_PROGRESS) {
            throw new BusinessException("ATTEMPT_NOT_IN_PROGRESS", "This lesson attempt is not in progress.");
        }

        if (exerciseAttemptRepository.existsByLessonAttemptIdAndExerciseId(attempt.getId(), request.getExerciseId())) {
            throw new BusinessException(
                    "EXERCISE_ALREADY_ANSWERED",
                    "This exercise has already been answered in this lesson attempt.");
        }

        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new BusinessException("EXERCISE_NOT_FOUND", "Exercise not found."));

        if (!exercise.getLesson().getId().equals(attempt.getLesson().getId())) {
            throw new BusinessException("EXERCISE_NOT_IN_LESSON",
                    "This exercise does not belong to the lesson attempt.");
        }

        AnswerValidationResult validationResult = validateAnswer(exercise, request);

        ExerciseAttempt exerciseAttempt = new ExerciseAttempt();
        exerciseAttempt.setLessonAttempt(attempt);
        exerciseAttempt.setExercise(exercise);
        exerciseAttempt.setSubmittedAnswer(validationResult.submittedAnswer());
        exerciseAttempt.setNormalizedAnswer(validationResult.normalizedAnswer());
        exerciseAttempt.setSelectedOptionId(validationResult.selectedOptionId());
        exerciseAttempt.setCorrect(validationResult.correct());

        ExerciseAttempt savedExerciseAttempt = exerciseAttemptRepository.save(exerciseAttempt);

        if (!validationResult.correct()) {
            reviewService.registerWrongAnswer(user, exercise, savedExerciseAttempt);
        }

        return new AnswerSubmissionResponse(
                savedExerciseAttempt.getId(),
                exercise.getId(),
                validationResult.submittedAnswer(),
                validationResult.normalizedAnswer(),
                validationResult.selectedOptionId(),
                validationResult.correct(),
                validationResult.expectedAnswer());
    }

    private AnswerValidationResult validateAnswer(Exercise exercise, AnswerSubmissionRequest request) {
        if (exercise.getType() == ExerciseType.MULTIPLE_CHOICE) {
            return validateMultipleChoiceAnswer(exercise, request);
        }

        if (exercise.getType() == ExerciseType.TYPE_ANSWER) {
            return validateTypedAnswer(exercise, request);
        }

        throw new BusinessException("UNSUPPORTED_EXERCISE_TYPE", "Unsupported exercise type.");
    }

    private AnswerValidationResult validateMultipleChoiceAnswer(Exercise exercise, AnswerSubmissionRequest request) {
        if (request.getSelectedOptionId() == null) {
            throw new BusinessException("SELECTED_OPTION_REQUIRED",
                    "selectedOptionId is required for multiple choice exercises.");
        }

        ExerciseOption selectedOption = exerciseOptionRepository.findById(request.getSelectedOptionId())
                .orElseThrow(() -> new BusinessException("OPTION_NOT_FOUND", "Selected option not found."));

        if (!selectedOption.getExercise().getId().equals(exercise.getId())) {
            throw new BusinessException("OPTION_NOT_IN_EXERCISE", "Selected option does not belong to this exercise.");
        }

        return new AnswerValidationResult(
                selectedOption.getTextValue(),
                answerNormalizer.normalize(selectedOption.getTextValue()),
                selectedOption.getId(),
                selectedOption.isCorrect(),
                exercise.getCorrectAnswer());
    }

    private AnswerValidationResult validateTypedAnswer(Exercise exercise, AnswerSubmissionRequest request) {
        if (request.getAnswer() == null || request.getAnswer().isBlank()) {
            throw new BusinessException("ANSWER_REQUIRED", "answer is required for typed exercises.");
        }

        String submittedAnswer = request.getAnswer();
        String normalizedAnswer = answerNormalizer.normalize(submittedAnswer);
        String expectedAnswer = exercise.getCorrectAnswer();

        boolean correct = exercise.getAcceptedAnswers()
                .stream()
                .map(ExerciseAcceptedAnswer::getAnswerText)
                .map(answerNormalizer::normalize)
                .anyMatch(normalizedAnswer::equals);

        if (exercise.getAcceptedAnswers().isEmpty()) {
            String normalizedExpectedAnswer = answerNormalizer.normalize(expectedAnswer);
            correct = normalizedAnswer.equals(normalizedExpectedAnswer);
        }

        return new AnswerValidationResult(
                submittedAnswer,
                normalizedAnswer,
                null,
                correct,
                expectedAnswer);
    }

    @Transactional
    public CompleteLessonAttemptResponse completeAttempt(Long attemptId, User user) {
        LessonAttempt attempt = lessonAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new BusinessException("ATTEMPT_NOT_FOUND", "Lesson attempt not found."));

        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new BusinessException("ATTEMPT_FORBIDDEN", "This lesson attempt does not belong to you.");
        }

        if (attempt.getStatus() != LessonAttemptStatus.IN_PROGRESS) {
            throw new BusinessException("ATTEMPT_NOT_IN_PROGRESS", "This lesson attempt is not in progress.");
        }

        long totalExercises = exerciseRepository.countByLessonIdAndPublishedTrue(
                attempt.getLesson().getId());

        long answeredExercises = exerciseAttemptRepository.countByLessonAttemptId(attempt.getId());

        if (answeredExercises < totalExercises) {
            throw new BusinessException(
                    "LESSON_NOT_FULLY_ANSWERED",
                    "You must answer all lesson exercises before completing the lesson.");
        }

        long correctAnswers = exerciseAttemptRepository.countByLessonAttemptIdAndCorrectTrue(attempt.getId());

        int scorePercent = totalExercises == 0
                ? 0
                : (int) Math.round((correctAnswers * 100.0) / totalExercises);

        attempt.markCompleted();

        int xpAwarded = progressService.applyLessonCompletion(user, attempt, scorePercent);

        return new CompleteLessonAttemptResponse(
                attempt.getId(),
                attempt.getLesson().getId(),
                attempt.getStatus().name(),
                totalExercises,
                answeredExercises,
                correctAnswers,
                xpAwarded);
    }

    private record AnswerValidationResult(
            String submittedAnswer,
            String normalizedAnswer,
            Long selectedOptionId,
            boolean correct,
            String expectedAnswer) {
    }
}