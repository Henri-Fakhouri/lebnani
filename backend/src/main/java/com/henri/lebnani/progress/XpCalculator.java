package com.henri.lebnani.progress;

import org.springframework.stereotype.Component;

@Component
public class XpCalculator {

    private static final int BASE_LESSON_XP = 10;

    public int calculateLessonCompletionXp(int scorePercent) {
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