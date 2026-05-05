package com.henri.lebnani.progress;

import com.henri.lebnani.attempt.LessonAttempt;
import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class ProgressService {

    private static final int BASE_LESSON_XP = 10;

    private final XpEventRepository xpEventRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final StreakStateRepository streakStateRepository;

    public ProgressService(
            XpEventRepository xpEventRepository,
            UserLessonProgressRepository userLessonProgressRepository,
            StreakStateRepository streakStateRepository
    ) {
        this.xpEventRepository = xpEventRepository;
        this.userLessonProgressRepository = userLessonProgressRepository;
        this.streakStateRepository = streakStateRepository;
    }

    @Transactional
    public int applyLessonCompletion(User user, LessonAttempt lessonAttempt, int scorePercent) {
        int xpAmount = calculateXp(scorePercent);

        XpEvent xpEvent = new XpEvent();
        xpEvent.setUser(user);
        xpEvent.setLessonAttempt(lessonAttempt);
        xpEvent.setAmount(xpAmount);
        xpEvent.setReason("LESSON_COMPLETED");
        xpEventRepository.save(xpEvent);

        Lesson lesson = lessonAttempt.getLesson();

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

    private int calculateXp(int scorePercent) {
        if (scorePercent >= 100) {
            return BASE_LESSON_XP;
        }

        if (scorePercent >= 70) {
            return 7;
        }

        if (scorePercent >= 40) {
            return 4;
        }

        return 1;
    }
}