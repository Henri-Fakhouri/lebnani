package com.henri.lebnani.progress;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StreakStateRepository extends JpaRepository<StreakState, Long> {

    Optional<StreakState> findByUserId(Long userId);
}