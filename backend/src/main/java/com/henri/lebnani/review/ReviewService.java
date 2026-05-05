package com.henri.lebnani.review;

import com.henri.lebnani.attempt.ExerciseAttempt;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewItemRepository reviewItemRepository;

    public ReviewService(ReviewItemRepository reviewItemRepository) {
        this.reviewItemRepository = reviewItemRepository;
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
}