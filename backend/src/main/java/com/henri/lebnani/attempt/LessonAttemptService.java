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

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

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
        Lesson lesson = lessonRepository.findById(Objects.requireNonNull(lessonId))
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
        LessonAttempt attempt = lessonAttemptRepository.findById(Objects.requireNonNull(attemptId))
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

        Exercise exercise = exerciseRepository.findById(Objects.requireNonNull(request.getExerciseId()))
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

    @Transactional
    public CompleteLessonAttemptResponse completeAttempt(Long attemptId, User user) {
        LessonAttempt attempt = lessonAttemptRepository.findById(Objects.requireNonNull(attemptId))
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
                ? 100
                : (int) Math.round((correctAnswers * 100.0) / totalExercises);

        attempt.markCompleted();

        int xpAwarded = progressService.applyLessonCompletion(user, attempt, scorePercent);

        List<ExerciseAttempt> wrongAttempts = exerciseAttemptRepository
                .findByLessonAttemptIdAndCorrectFalse(attempt.getId());

        List<CompleteLessonAttemptResponse.WrongAnswerDetail> wrongAnswerDetails = wrongAttempts.stream()
                .map(ea -> new CompleteLessonAttemptResponse.WrongAnswerDetail(
                        ea.getExercise().getPromptFr(),
                        ea.getSubmittedAnswer(),
                        ea.getExercise().getCorrectAnswer()))
                .toList();

        return new CompleteLessonAttemptResponse(
                attempt.getId(),
                attempt.getLesson().getId(),
                attempt.getStatus().name(),
                totalExercises,
                answeredExercises,
                correctAnswers,
                xpAwarded,
                wrongAnswerDetails);
    }

    // ── Private validation helpers ──────────────────────────────────────────

    private AnswerValidationResult validateAnswer(Exercise exercise, AnswerSubmissionRequest request) {
        ExerciseType exerciseType = exercise.getType();

        if (exerciseType == null) {
            throw new BusinessException("UNSUPPORTED_EXERCISE_TYPE", "Unsupported exercise type.");
        }

        return switch (exerciseType) {
            case MULTIPLE_CHOICE -> validateMultipleChoiceAnswer(exercise, request);
            case TYPE_ANSWER -> validateTypedAnswer(exercise, request);
            case MATCH_PAIRS -> validateMatchPairsAnswer(exercise, request);
            case WORD_BANK_SENTENCE -> validateWordBankSentenceAnswer(exercise, request);
        };
    }

    private AnswerValidationResult validateMultipleChoiceAnswer(Exercise exercise, AnswerSubmissionRequest request) {
        if (request.getSelectedOptionId() == null) {
            throw new BusinessException("SELECTED_OPTION_REQUIRED",
                    "selectedOptionId is required for multiple choice exercises.");
        }

        ExerciseOption selectedOption = exerciseOptionRepository
                .findById(Objects.requireNonNull(request.getSelectedOptionId()))
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

        boolean correct;

        if (exercise.getAcceptedAnswers().isEmpty()) {
            correct = normalizedAnswer.equals(answerNormalizer.normalize(expectedAnswer));
        } else {
            correct = exercise.getAcceptedAnswers()
                    .stream()
                    .map(ExerciseAcceptedAnswer::getAnswerText)
                    .map(answerNormalizer::normalize)
                    .anyMatch(normalizedAnswer::equals);
        }

        return new AnswerValidationResult(submittedAnswer, normalizedAnswer, null, correct, expectedAnswer);
    }

    private AnswerValidationResult validateMatchPairsAnswer(Exercise exercise, AnswerSubmissionRequest request) {
        if (request.getAnswer() == null || request.getAnswer().isBlank()) {
            throw new BusinessException("ANSWER_REQUIRED", "answer is required for matching pair exercises.");
        }

        String submittedAnswer = request.getAnswer();
        String expectedAnswer = resolveMatchPairsExpectedAnswer(exercise);
        String normalizedAnswer = normalizePairSignature(submittedAnswer);
        String normalizedExpectedAnswer = normalizePairSignature(expectedAnswer);

        return new AnswerValidationResult(
                submittedAnswer, normalizedAnswer, null,
                normalizedAnswer.equals(normalizedExpectedAnswer), expectedAnswer);
    }

    private String resolveMatchPairsExpectedAnswer(Exercise exercise) {
        if (exercise.getCorrectAnswer() != null && !exercise.getCorrectAnswer().isBlank()) {
            return exercise.getCorrectAnswer();
        }
        return exercise.getOptions()
                .stream()
                .sorted(Comparator.comparingInt(ExerciseOption::getDisplayOrder))
                .map(ExerciseOption::getTextValue)
                .collect(Collectors.joining("|"));
    }

    private String normalizePairSignature(String value) {
        return value.lines()
                .flatMap(line -> java.util.Arrays.stream(line.split("\\|")))
                .map(String::trim)
                .filter(pair -> !pair.isBlank())
                .map(this::normalizePair)
                .sorted()
                .collect(Collectors.joining("|"));
    }

    private String normalizePair(String rawPair) {
        String[] parts = rawPair.split("=>", 2);
        if (parts.length != 2) {
            return answerNormalizer.normalize(rawPair);
        }
        return answerNormalizer.normalize(parts[0]) + "=>" + answerNormalizer.normalize(parts[1]);
    }

    private AnswerValidationResult validateWordBankSentenceAnswer(Exercise exercise, AnswerSubmissionRequest request) {
        if (request.getAnswer() == null || request.getAnswer().isBlank()) {
            throw new BusinessException("ANSWER_REQUIRED", "answer is required for word bank sentence exercises.");
        }

        if (exercise.getCorrectAnswer() == null || exercise.getCorrectAnswer().isBlank()) {
            throw new BusinessException("CORRECT_ANSWER_MISSING", "Word bank sentence exercise has no correct answer.");
        }

        String submittedAnswer = request.getAnswer();
        String normalizedAnswer = answerNormalizer.normalize(submittedAnswer);
        String expectedAnswer = exercise.getCorrectAnswer();

        return new AnswerValidationResult(
                submittedAnswer, normalizedAnswer, null,
                normalizedAnswer.equals(answerNormalizer.normalize(expectedAnswer)), expectedAnswer);
    }

    private record AnswerValidationResult(
            String submittedAnswer,
            String normalizedAnswer,
            Long selectedOptionId,
            boolean correct,
            String expectedAnswer) {
    }
}