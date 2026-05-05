package com.henri.lebnani.review;

import com.henri.lebnani.attempt.AnswerNormalizer;
import com.henri.lebnani.attempt.ExerciseAttempt;
import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewItemRepository reviewItemRepository;
    private final AnswerNormalizer answerNormalizer;

    public ReviewService(
            ReviewItemRepository reviewItemRepository,
            AnswerNormalizer answerNormalizer
    ) {
        this.reviewItemRepository = reviewItemRepository;
        this.answerNormalizer = answerNormalizer;
    }

    @Transactional
    public void registerWrongAnswer(User user, Exercise exercise, ExerciseAttempt exerciseAttempt) {
        ReviewItem reviewItem = reviewItemRepository
                .findByUserIdAndExerciseId(user.getId(), exercise.getId())
                .orElseGet(ReviewItem::new);

        if (reviewItem.getId() == null) {
            reviewItem.createForWrongAnswer(user, exercise, exerciseAttempt);
        } else {
            reviewItem.registerFailure(exerciseAttempt);
        }

        reviewItemRepository.save(reviewItem);
    }

    @Transactional(readOnly = true)
    public List<ReviewItemResponse> getDueReviewItems(User user) {
        return reviewItemRepository
                .findByUserIdAndStatusAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(
                        user.getId(),
                        ReviewItemStatus.DUE,
                        Instant.now()
                )
                .stream()
                .map(ReviewItemResponse::new)
                .toList();
    }

    @Transactional
    public ReviewAnswerResponse answerReviewItem(Long reviewItemId, ReviewAnswerRequest request, User user) {
        ReviewItem reviewItem = reviewItemRepository.findByIdWithExercise(reviewItemId)
                .orElseThrow(() -> new BusinessException("REVIEW_ITEM_NOT_FOUND", "Review item not found."));

        if (!reviewItem.getUser().getId().equals(user.getId())) {
            throw new BusinessException("REVIEW_ITEM_FORBIDDEN", "This review item does not belong to you.");
        }

        if (reviewItem.getStatus() == ReviewItemStatus.MASTERED) {
            throw new BusinessException("REVIEW_ITEM_MASTERED", "This review item is already mastered.");
        }

        Exercise exercise = reviewItem.getExercise();

        String submittedAnswer = request.getAnswer();
        String normalizedAnswer = answerNormalizer.normalize(submittedAnswer);
        String expectedAnswer = exercise.getCorrectAnswer();
        String normalizedExpectedAnswer = answerNormalizer.normalize(expectedAnswer);

        boolean correct = normalizedAnswer.equals(normalizedExpectedAnswer);

        reviewItem.registerReviewAnswer(correct);
        reviewItemRepository.save(reviewItem);

        return new ReviewAnswerResponse(
                reviewItem.getId(),
                exercise.getId(),
                submittedAnswer,
                normalizedAnswer,
                correct,
                expectedAnswer,
                reviewItem.getStatus().name(),
                reviewItem.getFailureCount(),
                reviewItem.getSuccessCount(),
                reviewItem.getNextReviewAt()
        );
    }
}