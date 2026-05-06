package com.henri.lebnani.content;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContentRestoreLessonRepository extends JpaRepository<ContentRestoreLesson, Long> {

    List<ContentRestoreLesson> findByRestorePointId(Long restorePointId);
}