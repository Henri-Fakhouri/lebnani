package com.henri.lebnani.progress;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.henri.lebnani.attempt.LessonAttempt;
import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.course.Course;
import com.henri.lebnani.course.CourseRepository;
import com.henri.lebnani.course.CourseUnit;
import com.henri.lebnani.course.CourseUnitRepository;
import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.course.LessonRepository;
import com.henri.lebnani.user.User;

@Service
public class ProgressService {

    private final XpCalculator xpCalculator;
    private final XpEventRepository xpEventRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final StreakStateRepository streakStateRepository;
    private final CourseRepository courseRepository;
    private final CourseUnitRepository courseUnitRepository;
    private final LessonRepository lessonRepository;

    public ProgressService(
            XpCalculator xpCalculator,
            XpEventRepository xpEventRepository,
            UserLessonProgressRepository userLessonProgressRepository,
            StreakStateRepository streakStateRepository,
            CourseRepository courseRepository,
            CourseUnitRepository courseUnitRepository,
            LessonRepository lessonRepository
    ) {
        this.xpCalculator = xpCalculator;
        this.xpEventRepository = xpEventRepository;
        this.userLessonProgressRepository = userLessonProgressRepository;
        this.streakStateRepository = streakStateRepository;
        this.courseRepository = courseRepository;
        this.courseUnitRepository = courseUnitRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional
    public int applyLessonCompletion(User user, LessonAttempt lessonAttempt, int scorePercent) {
        Lesson lesson = lessonAttempt.getLesson();

        UserLessonProgress existingProgress = userLessonProgressRepository
                .findByUserIdAndLessonId(user.getId(), lesson.getId())
                .orElse(null);

        boolean alreadyCompleted = existingProgress != null && existingProgress.isCompleted();

        int xpAmount = alreadyCompleted
                ? 0
                : xpCalculator.calculateLessonCompletionXp(scorePercent);

        if (xpAmount > 0) {
            XpEvent xpEvent = new XpEvent();
            xpEvent.setUser(user);
            xpEvent.setLessonAttempt(lessonAttempt);
            xpEvent.setAmount(xpAmount);
            xpEvent.setReason("LESSON_COMPLETED");
            xpEventRepository.save(xpEvent);
        }

        UserLessonProgress progress = userLessonProgressRepository
                .findByUserIdAndLessonId(user.getId(), lesson.getId())
                .orElseGet(() -> {
                    UserLessonProgress newProgress = new UserLessonProgress();
                    newProgress.setUser(user);
                    newProgress.setLesson(lesson);
                    return newProgress;
                });

        progress.updateCompletion(scorePercent);
        userLessonProgressRepository.save(progress);

        StreakState streakState = streakStateRepository
                .findByUserId(user.getId())
                .orElseGet(() -> {
                    StreakState newState = new StreakState();
                    newState.setUser(user);
                    return newState;
                });

        streakState.registerActivity(LocalDate.now());
        streakStateRepository.save(streakState);

        return xpAmount;
    }

    @Transactional(readOnly = true)
    public UserProgressResponse getUserProgress(User user) {
        int totalXp = xpEventRepository.sumXpByUserId(user.getId());
        long completedLessons = userLessonProgressRepository.countByUserIdAndCompletedTrue(user.getId());

        StreakState streakState = streakStateRepository
                .findByUserId(user.getId())
                .orElse(null);

        int currentStreak = streakState == null ? 0 : streakState.getCurrentStreak();
        int longestStreak = streakState == null ? 0 : streakState.getLongestStreak();

        return new UserProgressResponse(
                totalXp,
                completedLessons,
                currentStreak,
                longestStreak
        );
    }

    @Transactional(readOnly = true)
    public CourseProgressResponse getCourseProgress(Long courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException("COURSE_NOT_FOUND", "Course not found."));

        List<CourseUnit> units = courseUnitRepository.findByCourseIdAndPublishedTrueOrderByDisplayOrderAsc(courseId);
        List<Lesson> lessons = lessonRepository
                .findByUnitCourseIdAndPublishedTrueOrderByUnitDisplayOrderAscDisplayOrderAsc(courseId);

        Map<Long, UserLessonProgress> progressByLessonId = userLessonProgressRepository.findByUserId(Objects.requireNonNull(user.getId()))
                .stream()
                .collect(Collectors.toMap(
                        progress -> progress.getLesson().getId(),
                        progress -> progress
                ));

        Map<Long, List<Lesson>> lessonsByUnitId = lessons.stream()
                .collect(Collectors.groupingBy(lesson -> lesson.getUnit().getId()));

        List<UnitProgressResponse> unitResponses = units.stream()
                .map(unit -> {
                    List<Lesson> unitLessons = lessonsByUnitId.getOrDefault(unit.getId(), List.of())
                            .stream()
                            .sorted(Comparator.comparingInt(Lesson::getDisplayOrder))
                            .toList();

                    List<LessonProgressResponse> lessonResponses = unitLessons.stream()
                            .map(lesson -> {
                                UserLessonProgress lessonProgress = progressByLessonId.get(lesson.getId());

                                boolean completed = lessonProgress != null && lessonProgress.isCompleted();
                                int bestScorePercent = lessonProgress == null
                                        ? 0
                                        : lessonProgress.getBestScorePercent();

                                return new LessonProgressResponse(
                                        lesson.getId(),
                                        lesson.getTitle(),
                                        lesson.getDisplayOrder(),
                                        completed,
                                        bestScorePercent
                                );
                            })
                            .toList();

                    int completedLessons = (int) lessonResponses.stream()
                            .filter(LessonProgressResponse::isCompleted)
                            .count();

                    return new UnitProgressResponse(
                            unit.getId(),
                            unit.getTitle(),
                            unit.getDisplayOrder(),
                            lessonResponses.size(),
                            completedLessons,
                            lessonResponses
                    );
                })
                .toList();

        int totalLessons = lessons.size();
        int completedLessons = (int) unitResponses.stream()
                .mapToLong(UnitProgressResponse::getCompletedLessons)
                .sum();

        return new CourseProgressResponse(
                course.getId(),
                course.getTitle(),
                totalLessons,
                completedLessons,
                unitResponses
        );
    }
}