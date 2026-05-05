package com.henri.lebnani.attempt;

import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.course.LessonRepository;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.exercise.ExerciseRepository;
import com.henri.lebnani.progress.ProgressService;
import com.henri.lebnani.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LessonAttemptService {

    private final LessonRepository lessonRepository;
    private final ExerciseRepository exerciseRepository;
    private final LessonAttemptRepository lessonAttemptRepository;
    private final ExerciseAttemptRepository exerciseAttemptRepository;
    private final AnswerNormalizer answerNormalizer;
    private final ProgressService progressService;

    public LessonAttemptService(
            LessonRepository lessonRepository,
            ExerciseRepository exerciseRepository,
            LessonAttemptRepository lessonAttemptRepository,
            ExerciseAttemptRepository exerciseAttemptRepository,
            AnswerNormalizer answerNormalizer,
            ProgressService progressService
    ) {
        this.lessonRepository = lessonRepository;
        this.exerciseRepository = exerciseRepository;
        this.lessonAttemptRepository = lessonAttemptRepository;
        this.exerciseAttemptRepository = exerciseAttemptRepository;
        this.answerNormalizer = answerNormalizer;
        this.progressService = progressService;
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
                savedAttempt.getStatus().name()
        );
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

        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new BusinessException("EXERCISE_NOT_FOUND", "Exercise not found."));

        if (!exercise.getLesson().getId().equals(attempt.getLesson().getId())) {
            throw new BusinessException("EXERCISE_NOT_IN_LESSON", "This exercise does not belong to the lesson attempt.");
        }

        String submittedAnswer = request.getAnswer();
        String normalizedAnswer = answerNormalizer.normalize(submittedAnswer);
        String expectedAnswer = exercise.getCorrectAnswer();
        String normalizedExpectedAnswer = answerNormalizer.normalize(expectedAnswer);

        boolean correct = normalizedAnswer.equals(normalizedExpectedAnswer);

        ExerciseAttempt exerciseAttempt = new ExerciseAttempt();
        exerciseAttempt.setLessonAttempt(attempt);
        exerciseAttempt.setExercise(exercise);
        exerciseAttempt.setSubmittedAnswer(submittedAnswer);
        exerciseAttempt.setNormalizedAnswer(normalizedAnswer);
        exerciseAttempt.setCorrect(correct);

        ExerciseAttempt savedExerciseAttempt = exerciseAttemptRepository.save(exerciseAttempt);

        return new AnswerSubmissionResponse(
                savedExerciseAttempt.getId(),
                exercise.getId(),
                submittedAnswer,
                normalizedAnswer,
                correct,
                expectedAnswer
        );
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
                attempt.getLesson().getId()
        );

        long answeredExercises = exerciseAttemptRepository.countByLessonAttemptId(attempt.getId());

        if (answeredExercises < totalExercises) {
            throw new BusinessException(
                    "LESSON_NOT_FULLY_ANSWERED",
                    "You must answer all lesson exercises before completing the lesson."
            );
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
                xpAwarded
        );
    }
}