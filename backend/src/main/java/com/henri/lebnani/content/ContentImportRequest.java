package com.henri.lebnani.content;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class ContentImportRequest {

    @NotEmpty
    @Valid
    private List<UnitImport> units;

    public List<UnitImport> getUnits() {
        return units;
    }

    public static class UnitImport {

        @NotBlank
        private String title;

        private String description;

        @NotNull
        private Integer displayOrder;

        @NotEmpty
        @Valid
        private List<LessonImport> lessons;

        public String getTitle() {
            return title;
        }

        public String getDescription() {
            return description;
        }

        public Integer getDisplayOrder() {
            return displayOrder;
        }

        public List<LessonImport> getLessons() {
            return lessons;
        }
    }

    public static class LessonImport {

        @NotBlank
        private String title;

        private String description;

        @NotNull
        private Integer displayOrder;

        @Valid
        private List<ContentBlockImport> contentBlocks = List.of();

        @Valid
        private List<ExerciseImport> exercises = List.of();

        public String getTitle() {
            return title;
        }

        public String getDescription() {
            return description;
        }

        public Integer getDisplayOrder() {
            return displayOrder;
        }

        public List<ContentBlockImport> getContentBlocks() {
            return contentBlocks == null ? List.of() : contentBlocks;
        }

        public List<ExerciseImport> getExercises() {
            return exercises == null ? List.of() : exercises;
        }
    }

    public static class ContentBlockImport {

        @NotBlank
        private String type;

        @NotBlank
        private String content;

        @NotNull
        private Integer displayOrder;

        public String getType() {
            return type;
        }

        public String getContent() {
            return content;
        }

        public Integer getDisplayOrder() {
            return displayOrder;
        }
    }

    public static class ExerciseImport {

        @NotBlank
        private String type;

        @NotBlank
        private String promptFr;

        private String correctAnswer;

        @NotNull
        private Integer displayOrder;

        @Valid
        private List<OptionImport> options = List.of();

        private List<String> acceptedAnswers = List.of();

        public String getType() {
            return type;
        }

        public String getPromptFr() {
            return promptFr;
        }

        public String getCorrectAnswer() {
            return correctAnswer;
        }

        public Integer getDisplayOrder() {
            return displayOrder;
        }

        public List<OptionImport> getOptions() {
            return options == null ? List.of() : options;
        }

        public List<String> getAcceptedAnswers() {
            return acceptedAnswers == null ? List.of() : acceptedAnswers;
        }
    }

    public static class OptionImport {

        @NotBlank
        private String text;

        @NotNull
        private Boolean correct;

        @NotNull
        private Integer displayOrder;

        public String getText() {
            return text;
        }

        public Boolean getCorrect() {
            return correct;
        }

        public Integer getDisplayOrder() {
            return displayOrder;
        }
    }
}