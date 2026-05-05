package com.henri.lebnani.progress;

import com.henri.lebnani.user.User;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "streak_state")
public class StreakState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "current_streak", nullable = false)
    private int currentStreak;

    @Column(name = "longest_streak", nullable = false)
    private int longestStreak;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public int getLongestStreak() {
        return longestStreak;
    }

    public LocalDate getLastActivityDate() {
        return lastActivityDate;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void registerActivity(LocalDate activityDate) {
        if (lastActivityDate == null) {
            currentStreak = 1;
        } else if (lastActivityDate.equals(activityDate)) {
            // Same day: keep streak unchanged.
        } else if (lastActivityDate.plusDays(1).equals(activityDate)) {
            currentStreak++;
        } else {
            currentStreak = 1;
        }

        longestStreak = Math.max(longestStreak, currentStreak);
        lastActivityDate = activityDate;
        updatedAt = Instant.now();
    }
}