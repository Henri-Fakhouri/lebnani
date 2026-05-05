package com.henri.lebnani.progress;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface XpEventRepository extends JpaRepository<XpEvent, Long> {

    @Query("select coalesce(sum(x.amount), 0) from XpEvent x where x.user.id = :userId")
    int sumXpByUserId(Long userId);
}