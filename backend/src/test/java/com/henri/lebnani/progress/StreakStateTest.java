package com.henri.lebnani.progress;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

class StreakStateTest {

    @Test
    void shouldStartStreakAtOneOnFirstActivity() {
        StreakState streakState = new StreakState();

        streakState.registerActivity(LocalDate.of(2026, 5, 5));

        assertThat(streakState.getCurrentStreak()).isEqualTo(1);
        assertThat(streakState.getLongestStreak()).isEqualTo(1);
        assertThat(streakState.getLastActivityDate()).isEqualTo(LocalDate.of(2026, 5, 5));
    }

    @Test
    void shouldKeepSameStreakForSameDayActivity() {
        StreakState streakState = new StreakState();

        streakState.registerActivity(LocalDate.of(2026, 5, 5));
        streakState.registerActivity(LocalDate.of(2026, 5, 5));

        assertThat(streakState.getCurrentStreak()).isEqualTo(1);
        assertThat(streakState.getLongestStreak()).isEqualTo(1);
    }

    @Test
    void shouldIncrementStreakForNextDayActivity() {
        StreakState streakState = new StreakState();

        streakState.registerActivity(LocalDate.of(2026, 5, 5));
        streakState.registerActivity(LocalDate.of(2026, 5, 6));

        assertThat(streakState.getCurrentStreak()).isEqualTo(2);
        assertThat(streakState.getLongestStreak()).isEqualTo(2);
    }

    @Test
    void shouldResetStreakAfterMissedDay() {
        StreakState streakState = new StreakState();

        streakState.registerActivity(LocalDate.of(2026, 5, 5));
        streakState.registerActivity(LocalDate.of(2026, 5, 6));
        streakState.registerActivity(LocalDate.of(2026, 5, 8));

        assertThat(streakState.getCurrentStreak()).isEqualTo(1);
        assertThat(streakState.getLongestStreak()).isEqualTo(2);
        assertThat(streakState.getLastActivityDate()).isEqualTo(LocalDate.of(2026, 5, 8));
    }
}