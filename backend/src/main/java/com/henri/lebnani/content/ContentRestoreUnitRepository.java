package com.henri.lebnani.content;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContentRestoreUnitRepository extends JpaRepository<ContentRestoreUnit, Long> {

    List<ContentRestoreUnit> findByRestorePointIdOrderByOriginalDisplayOrderAscIdAsc(Long restorePointId);
}