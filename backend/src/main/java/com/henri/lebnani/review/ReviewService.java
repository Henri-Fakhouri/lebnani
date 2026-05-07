package com.henri.lebnani.review;

import com.henri.lebnani.attempt.AnswerNormalizer;
import com.henri.lebnani.attempt.ExerciseAttempt;
import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.progress.XpEvent;
import com.henri.lebnani.progress.XpEventRepository;
import com.henri.lebnani.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ReviewService {

    private static final int REVIEW_XP_AMOUNT = 2;
    private static final int DIFFICULT_FAILURE_THRESHOLD = 3;

    private final ReviewItemRepository reviewItemRepository;
    private final AnswerNormalizer answerNormalizer;
    private final XpEventRepository xpEventRepository;

    public ReviewService(
            ReviewItemRepository reviewItemRepository,
            AnswerNormalizer answerNormalizer,
            XpEventRepository xpEventRepository
    ) {
        this.reviewItemRepository = reviewItemRepository;
        this.answerNormalizer = answerNormalizer;
        this.xpEventRepository = xpEventRepository;
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

    /** Overload used by existing tests – fetches all due items with no unit filter. */
    @Transactional(readOnly = true)
    public List<ReviewItemResponse> getDueReviewItems(User user) {
        return getDueReviewItems(user, null);
    }

    @Transactional(readOnly = true)
    public List<ReviewItemResponse> getDueReviewItems(User user, Long unitId) {
        List<ReviewItem> items;

        if (unitId != null) {
            items = reviewItemRepository
                    .findByUserIdAndStatusAndNextReviewAtLessThanEqualAndUnitIdOrderByNextReviewAtAsc(
                            user.getId(), ReviewItemStatus.DUE, Instant.now(), unitId);
        } else {
            items = reviewItemRepository
                    .findByUserIdAndStatusAndNextReviewAtLessThanEqualOrderByNextReviewAtAsc(
                            user.getId(), ReviewItemStatus.DUE, Instant.now());
        }

        return items.stream().map(ReviewItemResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewItemResponse> getDifficultItems(User user) {
        return reviewItemRepository
                .findDifficultByUserId(user.getId(), DIFFICULT_FAILURE_THRESHOLD)
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
        boolean correct = normalizedAnswer.equals(answerNormalizer.normalize(expectedAnswer));

        reviewItem.registerReviewAnswer(correct);
        reviewItemRepository.save(reviewItem);

        int xpAwarded = 0;

        if (correct) {
            XpEvent xpEvent = new XpEvent();
            xpEvent.setUser(user);
            xpEvent.setAmount(REVIEW_XP_AMOUNT);
            xpEvent.setReason("REVIEW_CORRECT");
            xpEventRepository.save(xpEvent);
            xpAwarded = REVIEW_XP_AMOUNT;
        }

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
                reviewItem.getNextReviewAt(),
                xpAwarded
        );
    }
}