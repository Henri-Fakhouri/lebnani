package com.henri.lebnani.progress;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class XpCalculatorTest {

    private final XpCalculator xpCalculator = new XpCalculator();

    @Test
    void shouldReturnTenXpForPerfectScore() {
        assertThat(xpCalculator.calculateLessonCompletionXp(100)).isEqualTo(10);
    }

    @Test
    void shouldReturnSevenXpForGoodScore() {
        assertThat(xpCalculator.calculateLessonCompletionXp(70)).isEqualTo(7);
        assertThat(xpCalculator.calculateLessonCompletionXp(99)).isEqualTo(7);
    }

    @Test
    void shouldReturnFourXpForMediumScore() {
        assertThat(xpCalculator.calculateLessonCompletionXp(40)).isEqualTo(4);
        assertThat(xpCalculator.calculateLessonCompletionXp(69)).isEqualTo(4);
    }

    @Test
    void shouldReturnOneXpForLowScore() {
        assertThat(xpCalculator.calculateLessonCompletionXp(0)).isEqualTo(1);
        assertThat(xpCalculator.calculateLessonCompletionXp(39)).isEqualTo(1);
    }
}