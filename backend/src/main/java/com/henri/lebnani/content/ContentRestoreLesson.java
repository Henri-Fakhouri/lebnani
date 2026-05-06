package com.henri.lebnani.content;

import com.henri.lebnani.course.Lesson;
import jakarta.persistence.*;

@Entity
@Table(name = "content_restore_lesson")
public class ContentRestoreLesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "restore_point_id", nullable = false)
    private ContentRestorePoint restorePoint;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    public Long getId() {
        return id;
    }

    public ContentRestorePoint getRestorePoint() {
        return restorePoint;
    }

    public void setRestorePoint(ContentRestorePoint restorePoint) {
        this.restorePoint = restorePoint;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public void setLesson(Lesson lesson) {
        this.lesson = lesson;
    }
}