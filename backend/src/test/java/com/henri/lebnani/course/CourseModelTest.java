package com.henri.lebnani.course;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CourseModelTest {

    @Test
    void course_getters_and_setters_work() {
        Course course = new Course();
        setId(course, 1L);

        course.setCode("LEB-AR");
        course.setTitle("Lebanese Arabic");
        course.setDescription("Learn Lebanese Arabic");
        course.setSourceLanguage("fr");
        course.setTargetLanguage("apc");
        course.setPublished(true);

        assertThat(course.getId()).isEqualTo(1L);
        assertThat(course.getCode()).isEqualTo("LEB-AR");
        assertThat(course.getTitle()).isEqualTo("Lebanese Arabic");
        assertThat(course.getDescription()).isEqualTo("Learn Lebanese Arabic");
        assertThat(course.getSourceLanguage()).isEqualTo("fr");
        assertThat(course.getTargetLanguage()).isEqualTo("apc");
        assertThat(course.isPublished()).isTrue();
        assertThat(course.getCreatedAt()).isNotNull();
    }

    @Test
    void courseUnit_getters_and_setters_work() {
        Course course = new Course();
        setId(course, 1L);

        CourseUnit unit = new CourseUnit();
        setId(unit, 2L);

        unit.setCourse(course);
        unit.setTitle("Basics");
        unit.setDescription("Basic expressions");
        unit.setDisplayOrder(3);
        unit.setPublished(true);

        assertThat(unit.getId()).isEqualTo(2L);
        assertThat(unit.getCourse()).isEqualTo(course);
        assertThat(unit.getTitle()).isEqualTo("Basics");
        assertThat(unit.getDescription()).isEqualTo("Basic expressions");
        assertThat(unit.getDisplayOrder()).isEqualTo(3);
        assertThat(unit.isPublished()).isTrue();
        assertThat(unit.getCreatedAt()).isNotNull();
    }

    @Test
    void lesson_getters_and_setters_work() {
        CourseUnit unit = new CourseUnit();
        setId(unit, 2L);

        Lesson lesson = new Lesson();
        setId(lesson, 3L);

        lesson.setUnit(unit);
        lesson.setTitle("Greetings");
        lesson.setDescription("Common greetings");
        lesson.setDisplayOrder(4);
        lesson.setPublished(true);

        assertThat(lesson.getId()).isEqualTo(3L);
        assertThat(lesson.getUnit()).isEqualTo(unit);
        assertThat(lesson.getTitle()).isEqualTo("Greetings");
        assertThat(lesson.getDescription()).isEqualTo("Common greetings");
        assertThat(lesson.getDisplayOrder()).isEqualTo(4);
        assertThat(lesson.isPublished()).isTrue();
        assertThat(lesson.getCreatedAt()).isNotNull();
    }

    @Test
    void lessonContentBlock_getters_and_setters_work() {
        Lesson lesson = new Lesson();
        setId(lesson, 3L);

        LessonContentBlock block = new LessonContentBlock();
        setId(block, 4L);

        block.setLesson(lesson);
        block.setType(LessonContentBlockType.MARKDOWN);
        block.setContent("Some content");
        block.setDisplayOrder(5);

        assertThat(block.getId()).isEqualTo(4L);
        assertThat(block.getLesson()).isEqualTo(lesson);
        assertThat(block.getType()).isEqualTo(LessonContentBlockType.MARKDOWN);
        assertThat(block.getContent()).isEqualTo("Some content");
        assertThat(block.getDisplayOrder()).isEqualTo(5);
        assertThat(block.getCreatedAt()).isNotNull();
    }

    @Test
    void courseResponse_maps_course() {
        Course course = new Course();
        setId(course, 1L);
        course.setCode("LEB-AR");
        course.setTitle("Lebanese Arabic");
        course.setDescription("Learn Lebanese Arabic");
        course.setSourceLanguage("fr");
        course.setTargetLanguage("apc");

        CourseResponse response = new CourseResponse(course);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getCode()).isEqualTo("LEB-AR");
        assertThat(response.getTitle()).isEqualTo("Lebanese Arabic");
        assertThat(response.getDescription()).isEqualTo("Learn Lebanese Arabic");
        assertThat(response.getSourceLanguage()).isEqualTo("fr");
        assertThat(response.getTargetLanguage()).isEqualTo("apc");
    }

    @Test
    void courseUnitResponse_maps_unit() {
        CourseUnit unit = new CourseUnit();
        setId(unit, 2L);
        unit.setTitle("Basics");
        unit.setDescription("Basic expressions");
        unit.setDisplayOrder(3);

        CourseUnitResponse response = new CourseUnitResponse(unit);

        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getTitle()).isEqualTo("Basics");
        assertThat(response.getDescription()).isEqualTo("Basic expressions");
        assertThat(response.getDisplayOrder()).isEqualTo(3);
    }

    @Test
    void lessonResponse_maps_lesson() {
        Lesson lesson = new Lesson();
        setId(lesson, 3L);
        lesson.setTitle("Greetings");
        lesson.setDescription("Common greetings");
        lesson.setDisplayOrder(4);

        LessonResponse response = new LessonResponse(lesson);

        assertThat(response.getId()).isEqualTo(3L);
        assertThat(response.getTitle()).isEqualTo("Greetings");
        assertThat(response.getDescription()).isEqualTo("Common greetings");
        assertThat(response.getDisplayOrder()).isEqualTo(4);
    }

    @Test
    void lessonContentBlockResponse_maps_block() {
        LessonContentBlock block = new LessonContentBlock();
        setId(block, 4L);
        block.setType(LessonContentBlockType.EXAMPLE);
        block.setContent("Example content");
        block.setDisplayOrder(5);

        LessonContentBlockResponse response = new LessonContentBlockResponse(block);

        assertThat(response.getId()).isEqualTo(4L);
        assertThat(response.getType()).isEqualTo("EXAMPLE");
        assertThat(response.getContent()).isEqualTo("Example content");
        assertThat(response.getDisplayOrder()).isEqualTo(5);
    }

    @Test
    void lessonContentBlockType_values_are_available() {
        assertThat(LessonContentBlockType.valueOf("HEADING")).isEqualTo(LessonContentBlockType.HEADING);
        assertThat(LessonContentBlockType.valueOf("MARKDOWN")).isEqualTo(LessonContentBlockType.MARKDOWN);
        assertThat(LessonContentBlockType.valueOf("NOTE")).isEqualTo(LessonContentBlockType.NOTE);
        assertThat(LessonContentBlockType.valueOf("EXAMPLE")).isEqualTo(LessonContentBlockType.EXAMPLE);
    }

    private static void setId(Object entity, Long id) {
        try {
            var field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception exception) {
            throw new RuntimeException(exception);
        }
    }
}