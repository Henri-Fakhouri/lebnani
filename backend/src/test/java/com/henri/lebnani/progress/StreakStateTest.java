package com.henri.lebnani.progress;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class StreakStateTest {

    private final LocalDate today = LocalDate.now();

    @Test
    void first_activity_sets_streak_to_1() {
        StreakState state = new StreakState();
        state.registerActivity(today);

        assertThat(state.getCurrentStreak()).isEqualTo(1);
        assertThat(state.getLongestStreak()).isEqualTo(1);
        assertThat(state.getLastActivityDate()).isEqualTo(today);
    }

    @Test
    void same_day_activity_does_not_change_streak() {
        StreakState state = new StreakState();
        state.registerActivity(today);
        state.registerActivity(today);

        assertThat(state.getCurrentStreak()).isEqualTo(1);
    }

    @Test
    void consecutive_day_increments_streak() {
        StreakState state = new StreakState();
        state.registerActivity(today.minusDays(1));
        state.registerActivity(today);

        assertThat(state.getCurrentStreak()).isEqualTo(2);
    }

    @Test
    void gap_in_activity_resets_streak_to_1() {
        StreakState state = new StreakState();
        state.registerActivity(today.minusDays(5));
        state.registerActivity(today);

        assertThat(state.getCurrentStreak()).isEqualTo(1);
    }

    @Test
    void longest_streak_is_tracked() {
        StreakState state = new StreakState();
        state.registerActivity(today.minusDays(2));
        state.registerActivity(today.minusDays(1));
        state.registerActivity(today);

        assertThat(state.getLongestStreak()).isEqualTo(3);
    }

    @Test
    void longest_streak_not_reduced_after_reset() {
        StreakState state = new StreakState();
        state.registerActivity(today.minusDays(5));
        state.registerActivity(today.minusDays(4));
        state.registerActivity(today.minusDays(3));

        state.registerActivity(today);

        assertThat(state.getCurrentStreak()).isEqualTo(1);
        assertThat(state.getLongestStreak()).isEqualTo(3);
    }

    @Test
    void updated_at_is_refreshed_on_activity() {
        StreakState state = new StreakState();
        var before = state.getUpdatedAt();

        state.registerActivity(today);

        assertThat(state.getUpdatedAt()).isAfterOrEqualTo(before);
    }
}