package com.henri.lebnani.attempt;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AnswerNormalizerTest {

    private final AnswerNormalizer normalizer = new AnswerNormalizer();

    @Test
    void shouldTrimLowercaseAndRemoveExtraSpaces() {
        String result = normalizer.normalize("  Bonjour   Henri  ");

        assertThat(result).isEqualTo("bonjour henri");
    }

    @Test
    void shouldRemoveAccents() {
        String result = normalizer.normalize("comment ça va");

        assertThat(result).isEqualTo("comment ca va");
    }

    @Test
    void shouldRemoveBasicPunctuation() {
        String result = normalizer.normalize("Bonjour !!!");

        assertThat(result).isEqualTo("bonjour");
    }

    @Test
    void shouldReturnEmptyStringWhenInputIsNull() {
        String result = normalizer.normalize(null);

        assertThat(result).isEqualTo("");
    }
}