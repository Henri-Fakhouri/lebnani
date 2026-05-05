package com.henri.lebnani.content;

import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ContentImportValidator {

    private static final String OPTIONS_PATH = ".options";

    public void validate(ContentImportRequest request) {
        List<ContentValidationError> errors = new ArrayList<>();

        validateDuplicateUnitOrders(request, errors);
        validateUnits(request, errors);

        if (!errors.isEmpty()) {
            throw new ContentValidationException(errors);
        }
    }

    private void validateDuplicateUnitOrders(ContentImportRequest request, List<ContentValidationError> errors) {
        Set<Integer> seenOrders = new HashSet<>();

        for (ContentImportRequest.UnitImport unit : request.getUnits()) {
            if (unit.getDisplayOrder() != null && !seenOrders.add(unit.getDisplayOrder())) {
                errors.add(new ContentValidationError(
                        "units",
                        "Duplicate unit displayOrder: " + unit.getDisplayOrder()
                ));
            }
        }
    }

    private void validateUnits(ContentImportRequest request, List<ContentValidationError> errors) {
        for (int unitIndex = 0; unitIndex < request.getUnits().size(); unitIndex++) {
            ContentImportRequest.UnitImport unit = request.getUnits().get(unitIndex);
            String unitPath = "units[" + unitIndex + "]";

            validateDuplicateLessonOrders(unit, unitPath, errors);
            validateLessons(unit, unitPath, errors);
        }
    }

    private void validateDuplicateLessonOrders(
            ContentImportRequest.UnitImport unit,
            String unitPath,
            List<ContentValidationError> errors
    ) {
        Set<Integer> seenOrders = new HashSet<>();

        for (ContentImportRequest.LessonImport lesson : unit.getLessons()) {
            if (lesson.getDisplayOrder() != null && !seenOrders.add(lesson.getDisplayOrder())) {
                errors.add(new ContentValidationError(
                        unitPath + ".lessons",
                        "Duplicate lesson displayOrder: " + lesson.getDisplayOrder()
                ));
            }
        }
    }

    private void validateLessons(
            ContentImportRequest.UnitImport unit,
            String unitPath,
            List<ContentValidationError> errors
    ) {
        for (int lessonIndex = 0; lessonIndex < unit.getLessons().size(); lessonIndex++) {
            ContentImportRequest.LessonImport lesson = unit.getLessons().get(lessonIndex);
            String lessonPath = unitPath + ".lessons[" + lessonIndex + "]";

            validateDuplicateExerciseOrders(lesson, lessonPath, errors);
            validateExercises(lesson, lessonPath, errors);
        }
    }

    private void validateDuplicateExerciseOrders(
            ContentImportRequest.LessonImport lesson,
            String lessonPath,
            List<ContentValidationError> errors
    ) {
        Set<Integer> seenOrders = new HashSet<>();

        for (ContentImportRequest.ExerciseImport exercise : lesson.getExercises()) {
            if (exercise.getDisplayOrder() != null && !seenOrders.add(exercise.getDisplayOrder())) {
                errors.add(new ContentValidationError(
                        lessonPath + ".exercises",
                        "Duplicate exercise displayOrder: " + exercise.getDisplayOrder()
                ));
            }
        }
    }

    private void validateExercises(
            ContentImportRequest.LessonImport lesson,
            String lessonPath,
            List<ContentValidationError> errors
    ) {
        for (int exerciseIndex = 0; exerciseIndex < lesson.getExercises().size(); exerciseIndex++) {
            ContentImportRequest.ExerciseImport exercise = lesson.getExercises().get(exerciseIndex);
            String exercisePath = lessonPath + ".exercises[" + exerciseIndex + "]";

            String type = exercise.getType() == null ? "" : exercise.getType().trim().toUpperCase();

            if ("MULTIPLE_CHOICE".equals(type)) {
                validateMultipleChoice(exercise, exercisePath, errors);
            } else if ("TYPE_ANSWER".equals(type)) {
                validateTypedAnswer(exercise, exercisePath, errors);
            } else {
                errors.add(new ContentValidationError(
                        exercisePath + ".type",
                        "Unsupported exercise type: " + exercise.getType()
                ));
            }
        }
    }

    private void validateMultipleChoice(
            ContentImportRequest.ExerciseImport exercise,
            String exercisePath,
            List<ContentValidationError> errors
    ) {
        if (exercise.getOptions().isEmpty()) {
            errors.add(new ContentValidationError(
                    exercisePath + OPTIONS_PATH,
                    "MULTIPLE_CHOICE exercises must have options."
            ));
            return;
        }

        long correctOptions = exercise.getOptions()
                .stream()
                .filter(option -> Boolean.TRUE.equals(option.getCorrect()))
                .count();

        if (correctOptions != 1) {
            errors.add(new ContentValidationError(
                    exercisePath + OPTIONS_PATH,
                    "MULTIPLE_CHOICE exercises must have exactly one correct option."
            ));
        }

        Set<Integer> seenOrders = new HashSet<>();
        for (ContentImportRequest.OptionImport option : exercise.getOptions()) {
            if (option.getDisplayOrder() != null && !seenOrders.add(option.getDisplayOrder())) {
                errors.add(new ContentValidationError(
                        exercisePath + OPTIONS_PATH,
                        "Duplicate option displayOrder: " + option.getDisplayOrder()
                ));
            }
        }
    }

    private void validateTypedAnswer(
            ContentImportRequest.ExerciseImport exercise,
            String exercisePath,
            List<ContentValidationError> errors
    ) {
        boolean hasCorrectAnswer = exercise.getCorrectAnswer() != null && !exercise.getCorrectAnswer().isBlank();
        boolean hasAcceptedAnswers = !exercise.getAcceptedAnswers().isEmpty();

        if (!hasCorrectAnswer && !hasAcceptedAnswers) {
            errors.add(new ContentValidationError(
                    exercisePath,
                    "TYPE_ANSWER exercises must have correctAnswer or acceptedAnswers."
            ));
        }
    }
}