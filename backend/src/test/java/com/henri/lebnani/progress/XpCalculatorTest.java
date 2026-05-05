package com.henri.lebnani.progress;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class XpCalculatorTest {

    private final XpCalculator calculator = new XpCalculator();

    @Test
    void perfect_score_returns_10() {
        assertThat(calculator.calculateLessonCompletionXp(100)).isEqualTo(10);
    }

    @Test
    void score_at_70_returns_7() {
        assertThat(calculator.calculateLessonCompletionXp(70)).isEqualTo(7);
    }

    @Test
    void score_in_70_to_99_range_returns_7() {
        assertThat(calculator.calculateLessonCompletionXp(85)).isEqualTo(7);
        assertThat(calculator.calculateLessonCompletionXp(99)).isEqualTo(7);
    }

    @Test
    void score_at_40_returns_4() {
        assertThat(calculator.calculateLessonCompletionXp(40)).isEqualTo(4);
    }

    @Test
    void score_in_40_to_69_range_returns_4() {
        assertThat(calculator.calculateLessonCompletionXp(55)).isEqualTo(4);
        assertThat(calculator.calculateLessonCompletionXp(69)).isEqualTo(4);
    }

    @Test
    void score_below_40_returns_1() {
        assertThat(calculator.calculateLessonCompletionXp(39)).isEqualTo(1);
        assertThat(calculator.calculateLessonCompletionXp(0)).isEqualTo(1);
    }
}