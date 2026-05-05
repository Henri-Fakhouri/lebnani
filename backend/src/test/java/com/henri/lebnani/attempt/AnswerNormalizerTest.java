package com.henri.lebnani.attempt;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AnswerNormalizerTest {

    private final AnswerNormalizer normalizer = new AnswerNormalizer();

    @Test
    void null_input_returns_empty_string() {
        assertThat(normalizer.normalize(null)).isEmpty();
    }

    @Test
    void blank_input_returns_empty_string() {
        assertThat(normalizer.normalize("   ")).isEmpty();
    }

    @Test
    void trims_leading_and_trailing_whitespace() {
        assertThat(normalizer.normalize("  hello  ")).isEqualTo("hello");
    }

    @Test
    void lowercases_input() {
        assertThat(normalizer.normalize("HELLO")).isEqualTo("hello");
    }

    @Test
    void removes_diacritics() {
        assertThat(normalizer.normalize("café")).isEqualTo("cafe");
    }

    @Test
    void removes_punctuation() {
        assertThat(normalizer.normalize("hello!")).isEqualTo("hello");
        assertThat(normalizer.normalize("hello,")).isEqualTo("hello");
        assertThat(normalizer.normalize("hello.")).isEqualTo("hello");
    }

    @Test
    void collapses_multiple_spaces() {
        assertThat(normalizer.normalize("hello   world")).isEqualTo("hello world");
    }

    @Test
    void combined_normalization() {
        assertThat(normalizer.normalize("  Héllo, World!  ")).isEqualTo("hello world");
    }
}