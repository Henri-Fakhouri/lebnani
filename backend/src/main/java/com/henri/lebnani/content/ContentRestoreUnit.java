package com.henri.lebnani.content;

import com.henri.lebnani.course.CourseUnit;
import jakarta.persistence.*;

@Entity
@Table(name = "content_restore_unit")
public class ContentRestoreUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "restore_point_id", nullable = false)
    private ContentRestorePoint restorePoint;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private CourseUnit unit;

    @Column(name = "original_display_order", nullable = false)
    private int originalDisplayOrder;

    public Long getId() {
        return id;
    }

    public ContentRestorePoint getRestorePoint() {
        return restorePoint;
    }

    public void setRestorePoint(ContentRestorePoint restorePoint) {
        this.restorePoint = restorePoint;
    }

    public CourseUnit getUnit() {
        return unit;
    }

    public void setUnit(CourseUnit unit) {
        this.unit = unit;
    }

    public int getOriginalDisplayOrder() {
        return originalDisplayOrder;
    }

    public void setOriginalDisplayOrder(int originalDisplayOrder) {
        this.originalDisplayOrder = originalDisplayOrder;
    }
}