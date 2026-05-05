package com.henri.lebnani.attempt;

import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;

@Component
public class AnswerNormalizer {

    public String normalize(String input) {
        if (input == null) {
            return "";
        }

        String normalized = input.trim().toLowerCase(Locale.ROOT);

        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        normalized = normalized
                .replaceAll("[?!.,;:]", "")
                .replaceAll("\\s+", " ");

        return normalized.trim();
    }
}