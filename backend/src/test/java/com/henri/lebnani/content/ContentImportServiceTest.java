package com.henri.lebnani.content;

import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.course.Course;
import com.henri.lebnani.course.CourseRepository;
import com.henri.lebnani.course.CourseUnit;
import com.henri.lebnani.course.CourseUnitRepository;
import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.course.LessonContentBlock;
import com.henri.lebnani.course.LessonContentBlockRepository;
import com.henri.lebnani.course.LessonContentBlockType;
import com.henri.lebnani.course.LessonRepository;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.exercise.ExerciseAcceptedAnswer;
import com.henri.lebnani.exercise.ExerciseAcceptedAnswerRepository;
import com.henri.lebnani.exercise.ExerciseOption;
import com.henri.lebnani.exercise.ExerciseOptionRepository;
import com.henri.lebnani.exercise.ExerciseRepository;
import com.henri.lebnani.exercise.ExerciseType;
import com.henri.lebnani.user.Role;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SuppressWarnings("null")
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ContentImportServiceTest {

        @Mock
        CourseRepository courseRepository;
        @Mock
        CourseUnitRepository courseUnitRepository;
        @Mock
        LessonRepository lessonRepository;
        @Mock
        LessonContentBlockRepository lessonContentBlockRepository;
        @Mock
        ExerciseRepository exerciseRepository;
        @Mock
        ExerciseOptionRepository exerciseOptionRepository;
        @Mock
        ExerciseAcceptedAnswerRepository acceptedAnswerRepository;
        @Mock
        ContentImportValidator contentImportValidator;
        @Mock
        ContentImportRunRepository contentImportRunRepository;
        @Mock
        ContentRestorePointRepository contentRestorePointRepository;
        @Mock
        ContentRestoreUnitRepository contentRestoreUnitRepository;
        @Mock
        ContentRestoreLessonRepository contentRestoreLessonRepository;

        @InjectMocks
        ContentImportService contentImportService;

        @Test
        void importContent_throws_when_user_is_learner() {
                User learner = buildUser(1L, Role.LEARNER);
                ContentImportRequest request = request(List.of());

                assertThatThrownBy(() -> contentImportService.importContent(1L, request, learner))
                                .isInstanceOf(BusinessException.class)
                                .hasMessageContaining("Only admins or content editors");
        }

        @Test
        void importContent_throws_when_course_not_found() {
                User admin = buildUser(1L, Role.ADMIN);
                ContentImportRequest request = request(List.of());

                when(courseRepository.findById(99L)).thenReturn(Optional.empty());

                assertThatThrownBy(() -> contentImportService.importContent(99L, request, admin))
                                .isInstanceOf(BusinessException.class)
                                .hasMessageContaining("Course not found");
        }

        @Test
        void importContent_throws_when_course_id_is_null() {
                User admin = buildUser(1L, Role.ADMIN);
                ContentImportRequest request = request(List.of());

                assertThatThrownBy(() -> contentImportService.importContent(null, request, admin))
                                .isInstanceOf(NullPointerException.class);
        }

        @Test
        void importContent_throws_when_import_run_id_is_null_after_save() {
                User admin = buildUser(1L, Role.ADMIN);
                Course course = buildCourse(1L);
                ContentImportRequest request = request(List.of());

                when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
                when(contentImportRunRepository.save(any(ContentImportRun.class))).thenReturn(new ContentImportRun());

                assertThatThrownBy(() -> contentImportService.importContent(1L, request, admin))
                                .isInstanceOf(NullPointerException.class)
                                .hasMessageContaining("Import run ID should not be null after save.");
        }

        @Test
        void importContent_success_with_empty_units() {
                User admin = buildUser(1L, Role.ADMIN);
                Course course = buildCourse(1L);
                ContentImportRequest request = request(List.of());

                when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
                stubEntitySaves();

                ContentImportResponse response = contentImportService.importContent(1L, request, admin);

                assertThat(response).isNotNull();
                assertThat(response.getImportRunId()).isEqualTo(10L);
                assertThat(response.getCourseId()).isEqualTo(1L);
                assertThat(response.getUnitsCreated()).isZero();
                assertThat(response.getLessonsCreated()).isZero();
                assertThat(response.getContentBlocksCreated()).isZero();
                assertThat(response.getExercisesCreated()).isZero();
                assertThat(response.getOptionsCreated()).isZero();
                assertThat(response.getAcceptedAnswersCreated()).isZero();

                verify(contentImportRunRepository, times(2)).save(any(ContentImportRun.class));
        }

        @Test
        void importContent_replaceExisting_archives_only_matching_units_before_importing() {
                User admin = buildUser(1L, Role.ADMIN);
                Course course = buildCourse(1L);

                CourseUnit matchingUnit = buildUnit(10L, course, "Old matching unit", 303, true);
                CourseUnit untouchedUnit = buildUnit(11L, course, "Other unit", 304, true);

                Lesson matchingLesson = buildLesson(20L, matchingUnit, "Old matching lesson", 1, true);
                Lesson untouchedLesson = buildLesson(21L, untouchedUnit, "Other lesson", 1, true);

                ContentImportRequest request = request(List.of(
                                unit("New Unit 303", "New description", 303, List.of())));

                when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

                when(courseUnitRepository.findPublishedByCourseIdAndDisplayOrderIn(1L, List.of(303)))
                                .thenReturn(List.of(matchingUnit));

                when(lessonRepository.findPublishedByUnitIds(List.of(10L)))
                                .thenReturn(List.of(matchingLesson));

                when(courseUnitRepository.findByCourseIdAndDisplayOrderIn(1L, List.of(303)))
                                .thenReturn(List.of(matchingUnit));

                when(lessonRepository.findByUnitIds(List.of(10L)))
                                .thenReturn(List.of(matchingLesson));

                when(contentRestorePointRepository.save(any(ContentRestorePoint.class)))
                                .thenAnswer(invocation -> {
                                        ContentRestorePoint restorePoint = invocation.getArgument(0,
                                                        ContentRestorePoint.class);

                                        if (restorePoint.getId() == null) {
                                                setId(restorePoint, 100L);
                                        }

                                        return restorePoint;
                                });

                when(contentRestoreUnitRepository.save(any(ContentRestoreUnit.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0, ContentRestoreUnit.class));

                when(contentRestoreLessonRepository.save(any(ContentRestoreLesson.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0, ContentRestoreLesson.class));

                stubEntitySaves();

                ContentImportResponse response = contentImportService.importContent(1L, request, admin, true);

                assertThat(response).isNotNull();
                assertThat(response.getUnitsCreated()).isEqualTo(1);

                assertThat(matchingLesson.isPublished()).isFalse();
                assertThat(matchingUnit.isPublished()).isFalse();
                assertThat(matchingUnit.getDisplayOrder()).isEqualTo(-1_000_010);

                assertThat(untouchedLesson.isPublished()).isTrue();
                assertThat(untouchedUnit.isPublished()).isTrue();
                assertThat(untouchedUnit.getDisplayOrder()).isEqualTo(304);

                verify(contentRestorePointRepository).save(any(ContentRestorePoint.class));
                verify(contentRestoreUnitRepository).save(any(ContentRestoreUnit.class));
                verify(contentRestoreLessonRepository).save(any(ContentRestoreLesson.class));

                verify(lessonRepository).save(matchingLesson);
                verify(lessonRepository).flush();

                verify(courseUnitRepository).save(matchingUnit);
                verify(courseUnitRepository).flush();
        }

        @Test
        void importContent_success_with_full_content_tree() {
                User admin = buildUser(1L, Role.ADMIN);
                Course course = buildCourse(1L);

                ContentImportRequest.OptionImport option1 = option("Ana", true, 1);
                ContentImportRequest.OptionImport option2 = option("Enta", false, 2);

                ContentImportRequest.ExerciseImport multipleChoice = exercise(
                                ExerciseType.MULTIPLE_CHOICE.name().toLowerCase(),
                                "Choose the right answer",
                                "Ana",
                                1,
                                List.of(option1, option2),
                                List.of());

                ContentImportRequest.ExerciseImport typedWithAcceptedAnswers = exercise(
                                ExerciseType.TYPE_ANSWER.name(),
                                "Translate: I want to go",
                                "   ",
                                2,
                                List.of(),
                                List.of("baddi rou7", "baddi fell"));

                ContentImportRequest.ContentBlockImport block = block(
                                " " + LessonContentBlockType.values()[0].name().toLowerCase() + " ",
                                "Some lesson content",
                                1);

                ContentImportRequest request = request(List.of(
                                unit("Basics", "Unit description", 1, List.of(
                                                lesson("Lesson 1", "Lesson description", 1, List.of(block),
                                                                List.of(multipleChoice, typedWithAcceptedAnswers))))));

                when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
                stubEntitySaves();

                ContentImportResponse response = contentImportService.importContent(1L, request, admin);

                assertThat(response.getImportRunId()).isEqualTo(10L);
                assertThat(response.getCourseId()).isEqualTo(1L);
                assertThat(response.getUnitsCreated()).isEqualTo(1);
                assertThat(response.getLessonsCreated()).isEqualTo(1);
                assertThat(response.getContentBlocksCreated()).isEqualTo(1);
                assertThat(response.getExercisesCreated()).isEqualTo(2);
                assertThat(response.getOptionsCreated()).isEqualTo(2);
                assertThat(response.getAcceptedAnswersCreated()).isEqualTo(2);

                ArgumentCaptor<CourseUnit> unitCaptor = ArgumentCaptor.forClass(CourseUnit.class);
                verify(courseUnitRepository).save(unitCaptor.capture());
                assertThat(unitCaptor.getValue().getCourse()).isEqualTo(course);
                assertThat(unitCaptor.getValue().getTitle()).isEqualTo("Basics");
                assertThat(unitCaptor.getValue().getDescription()).isEqualTo("Unit description");
                assertThat(unitCaptor.getValue().getDisplayOrder()).isEqualTo(1);
                assertThat(unitCaptor.getValue().isPublished()).isTrue();

                ArgumentCaptor<Lesson> lessonCaptor = ArgumentCaptor.forClass(Lesson.class);
                verify(lessonRepository).save(lessonCaptor.capture());
                assertThat(lessonCaptor.getValue().getTitle()).isEqualTo("Lesson 1");
                assertThat(lessonCaptor.getValue().getDescription()).isEqualTo("Lesson description");
                assertThat(lessonCaptor.getValue().getDisplayOrder()).isEqualTo(1);
                assertThat(lessonCaptor.getValue().isPublished()).isTrue();

                ArgumentCaptor<LessonContentBlock> blockCaptor = ArgumentCaptor.forClass(LessonContentBlock.class);
                verify(lessonContentBlockRepository).save(blockCaptor.capture());
                assertThat(blockCaptor.getValue().getContent()).isEqualTo("Some lesson content");
                assertThat(blockCaptor.getValue().getDisplayOrder()).isEqualTo(1);

                ArgumentCaptor<Exercise> exerciseCaptor = ArgumentCaptor.forClass(Exercise.class);
                verify(exerciseRepository, times(2)).save(exerciseCaptor.capture());
                List<Exercise> savedExercises = exerciseCaptor.getAllValues();
                assertThat(savedExercises.get(0).getCorrectAnswer()).isEqualTo("Ana");
                assertThat(savedExercises.get(1).getCorrectAnswer()).isEqualTo("baddi rou7");

                ArgumentCaptor<ExerciseOption> optionCaptor = ArgumentCaptor.forClass(ExerciseOption.class);
                verify(exerciseOptionRepository, times(2)).save(optionCaptor.capture());
                assertThat(optionCaptor.getAllValues())
                                .extracting(ExerciseOption::getTextValue)
                                .containsExactly("Ana", "Enta");

                ArgumentCaptor<ExerciseAcceptedAnswer> acceptedAnswerCaptor = ArgumentCaptor
                                .forClass(ExerciseAcceptedAnswer.class);
                verify(acceptedAnswerRepository, times(2)).save(acceptedAnswerCaptor.capture());
                assertThat(acceptedAnswerCaptor.getAllValues())
                                .extracting(ExerciseAcceptedAnswer::getAnswerText)
                                .containsExactly("baddi rou7", "baddi fell");
                assertThat(acceptedAnswerCaptor.getAllValues())
                                .extracting(ExerciseAcceptedAnswer::getDisplayOrder)
                                .containsExactly(1, 2);
        }

        @Test
        void importContent_allows_content_editor() {
                User editor = buildUser(1L, Role.CONTENT_EDITOR);
                Course course = buildCourse(1L);
                ContentImportRequest request = request(List.of());

                when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
                stubEntitySaves();

                ContentImportResponse response = contentImportService.importContent(1L, request, editor);

                assertThat(response).isNotNull();
        }

        @Test
        void importContent_marks_run_failed_when_validation_throws() {
                User admin = buildUser(1L, Role.ADMIN);
                Course course = buildCourse(1L);
                ContentImportRun run = buildRun(10L);
                ContentImportRequest request = request(List.of());

                when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
                when(contentImportRunRepository.save(any(ContentImportRun.class))).thenReturn(run);
                org.mockito.Mockito.doThrow(new ContentValidationException(List.of()))
                                .when(contentImportValidator).validate(request);

                assertThatThrownBy(() -> contentImportService.importContent(1L, request, admin))
                                .isInstanceOf(ContentValidationException.class);

                assertThat(run.getStatus()).isEqualTo(ContentImportRunStatus.FAILED);
                assertThat(run.getCompletedAt()).isNotNull();
        }

        @Test
        void importContent_marks_run_failed_when_content_block_type_is_invalid() {
                User admin = buildUser(1L, Role.ADMIN);
                Course course = buildCourse(1L);

                ContentImportRequest request = request(List.of(
                                unit("Basics", "Unit description", 1, List.of(
                                                lesson("Lesson 1", "Lesson description", 1,
                                                                List.of(block("BAD_BLOCK_TYPE", "content", 1)),
                                                                List.of())))));

                when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
                stubEntitySaves();

                assertThatThrownBy(() -> contentImportService.importContent(1L, request, admin))
                                .isInstanceOf(BusinessException.class)
                                .hasMessageContaining("Invalid content block type");

                ArgumentCaptor<ContentImportRun> runCaptor = ArgumentCaptor.forClass(ContentImportRun.class);
                verify(contentImportRunRepository, times(2)).save(runCaptor.capture());
                assertThat(runCaptor.getAllValues().get(1).getStatus()).isEqualTo(ContentImportRunStatus.FAILED);
        }

        @Test
        void importContent_marks_run_failed_when_exercise_type_is_invalid() {
                User admin = buildUser(1L, Role.ADMIN);
                Course course = buildCourse(1L);

                ContentImportRequest request = request(List.of(
                                unit("Basics", "Unit description", 1, List.of(
                                                lesson("Lesson 1", "Lesson description", 1,
                                                                List.of(),
                                                                List.of(exercise("BAD_EXERCISE_TYPE", "prompt", null, 1,
                                                                                List.of(), List.of())))))));

                when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
                stubEntitySaves();

                assertThatThrownBy(() -> contentImportService.importContent(1L, request, admin))
                                .isInstanceOf(BusinessException.class)
                                .hasMessageContaining("Invalid exercise type");

                ArgumentCaptor<ContentImportRun> runCaptor = ArgumentCaptor.forClass(ContentImportRun.class);
                verify(contentImportRunRepository, times(2)).save(runCaptor.capture());
                assertThat(runCaptor.getAllValues().get(1).getStatus()).isEqualTo(ContentImportRunStatus.FAILED);
        }

        @Test
        void restoreLatestContent_restores_only_units_from_latest_restore_point() {
                User admin = buildUser(1L, Role.ADMIN);
                Course course = buildCourse(1L);

                ContentRestorePoint restorePoint = buildRestorePoint(99L, course, admin);

                CourseUnit oldUnit303 = buildUnit(10L, course, "Old 303", 303, false);
                CourseUnit currentUnit303 = buildUnit(30L, course, "Current 303", 303, true);
                CourseUnit untouchedUnit304 = buildUnit(40L, course, "Untouched 304", 304, true);

                Lesson oldLesson303 = buildLesson(20L, oldUnit303, "Old lesson 303", 1, false);
                Lesson currentLesson303 = buildLesson(31L, currentUnit303, "Current lesson 303", 1, true);
                Lesson untouchedLesson304 = buildLesson(41L, untouchedUnit304, "Untouched lesson 304", 1, true);

                ContentRestoreUnit restoreUnit = new ContentRestoreUnit();
                restoreUnit.setRestorePoint(restorePoint);
                restoreUnit.setUnit(oldUnit303);
                restoreUnit.setOriginalDisplayOrder(303);

                ContentRestoreLesson restoreLesson = new ContentRestoreLesson();
                restoreLesson.setRestorePoint(restorePoint);
                restoreLesson.setLesson(oldLesson303);

                when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
                when(contentRestorePointRepository.findFirstByCourseIdAndRestoredFalseOrderByCreatedAtDescIdDesc(1L))
                                .thenReturn(Optional.of(restorePoint));
                when(contentRestoreUnitRepository.findByRestorePointIdOrderByOriginalDisplayOrderAscIdAsc(99L))
                                .thenReturn(List.of(restoreUnit));
                when(contentRestoreLessonRepository.findByRestorePointId(99L))
                                .thenReturn(List.of(restoreLesson));

                when(courseUnitRepository.findPublishedByCourseIdAndDisplayOrderIn(1L, List.of(303)))
                                .thenReturn(List.of(currentUnit303));
                when(lessonRepository.findPublishedByUnitIds(List.of(30L)))
                                .thenReturn(List.of(currentLesson303));
                when(courseUnitRepository.findByCourseIdAndDisplayOrderIn(1L, List.of(303)))
                                .thenReturn(List.of(currentUnit303));
                when(lessonRepository.findByUnitIds(List.of(30L)))
                                .thenReturn(List.of(currentLesson303));

                stubEntitySaves();

                ContentRestoreResponse response = contentImportService.restoreLatestContent(1L, admin);

                assertThat(response.getRestorePointId()).isEqualTo(99L);
                assertThat(response.getCourseId()).isEqualTo(1L);
                assertThat(response.getUnitsRestored()).isEqualTo(1);
                assertThat(response.getLessonsRestored()).isEqualTo(1);

                assertThat(currentLesson303.isPublished()).isFalse();
                assertThat(currentUnit303.isPublished()).isFalse();
                assertThat(currentUnit303.getDisplayOrder()).isEqualTo(-1_000_030);

                assertThat(oldLesson303.isPublished()).isTrue();
                assertThat(oldUnit303.isPublished()).isTrue();
                assertThat(oldUnit303.getDisplayOrder()).isEqualTo(303);

                assertThat(untouchedLesson304.isPublished()).isTrue();
                assertThat(untouchedUnit304.isPublished()).isTrue();
                assertThat(untouchedUnit304.getDisplayOrder()).isEqualTo(304);

                assertThat(restorePoint.isRestored()).isTrue();
                assertThat(restorePoint.getRestoredAt()).isNotNull();
        }

        @Test
        void restoreLatestContent_throws_when_no_restore_point_exists() {
                User admin = buildUser(1L, Role.ADMIN);
                Course course = buildCourse(1L);

                when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
                when(contentRestorePointRepository.findFirstByCourseIdAndRestoredFalseOrderByCreatedAtDescIdDesc(1L))
                                .thenReturn(Optional.empty());

                assertThatThrownBy(() -> contentImportService.restoreLatestContent(1L, admin))
                                .isInstanceOf(BusinessException.class)
                                .hasMessageContaining("Aucune version précédente");
        }

        @Test
        void getImportRuns_throws_when_user_is_learner() {
                User learner = buildUser(1L, Role.LEARNER);

                assertThatThrownBy(() -> contentImportService.getImportRuns(1L, learner))
                                .isInstanceOf(BusinessException.class)
                                .hasMessageContaining("Only admins or content editors");
        }

        @Test
        void getImportRuns_returns_empty_for_admin() {
                User admin = buildUser(1L, Role.ADMIN);

                when(contentImportRunRepository.findByCourseIdOrderByStartedAtDesc(1L)).thenReturn(List.of());

                List<ContentImportRunResponse> result = contentImportService.getImportRuns(1L, admin);

                assertThat(result).isEmpty();
        }

        @Test
        void getImportRuns_returns_mapped_runs_for_content_editor() {
                User editor = buildUser(1L, Role.CONTENT_EDITOR);
                Course course = buildCourse(1L);
                User importingUser = buildUser(2L, Role.ADMIN);
                importingUser.setEmail("admin@email.com");

                ContentImportRun run = buildRun(77L);
                run.setCourse(course);
                run.setUser(importingUser);
                run.markCompleted(new ContentImportResponse(
                                77L,
                                1L,
                                new ContentImportResponse.ImportCounts(1, 2, 3, 4, 5, 6)));

                when(contentImportRunRepository.findByCourseIdOrderByStartedAtDesc(1L)).thenReturn(List.of(run));

                List<ContentImportRunResponse> result = contentImportService.getImportRuns(1L, editor);

                assertThat(result).hasSize(1);
                assertThat(result.get(0).getId()).isEqualTo(77L);
                assertThat(result.get(0).getCourseId()).isEqualTo(1L);
                assertThat(result.get(0).getCourseTitle()).isEqualTo("Course 1");
                assertThat(result.get(0).getUserId()).isEqualTo(2L);
                assertThat(result.get(0).getUserEmail()).isEqualTo("admin@email.com");
                assertThat(result.get(0).getStatus()).isEqualTo("COMPLETED");
                assertThat(result.get(0).getUnitsCreated()).isEqualTo(1);
                assertThat(result.get(0).getLessonsCreated()).isEqualTo(2);
                assertThat(result.get(0).getExercisesCreated()).isEqualTo(4);
                assertThat(result.get(0).getOptionsCreated()).isEqualTo(5);
                assertThat(result.get(0).getAcceptedAnswersCreated()).isEqualTo(6);
                assertThat(result.get(0).getStartedAt()).isNotNull();
                assertThat(result.get(0).getCompletedAt()).isNotNull();
        }

        private void stubEntitySaves() {
                when(contentImportRunRepository.save(any(ContentImportRun.class))).thenAnswer(invocation -> {
                        ContentImportRun run = invocation.getArgument(0, ContentImportRun.class);
                        if (run.getId() == null) {
                                setId(run, 10L);
                        }
                        return run;
                });

                when(contentRestorePointRepository.save(any(ContentRestorePoint.class))).thenAnswer(invocation -> {
                        ContentRestorePoint restorePoint = invocation.getArgument(0, ContentRestorePoint.class);
                        if (restorePoint.getId() == null) {
                                setId(restorePoint, 99L);
                        }
                        return restorePoint;
                });

                when(contentRestoreUnitRepository.save(any(ContentRestoreUnit.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0, ContentRestoreUnit.class));

                when(contentRestoreLessonRepository.save(any(ContentRestoreLesson.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0, ContentRestoreLesson.class));

                when(courseUnitRepository.save(any(CourseUnit.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0, CourseUnit.class));

                when(lessonRepository.save(any(Lesson.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0, Lesson.class));

                when(lessonContentBlockRepository.save(any(LessonContentBlock.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0, LessonContentBlock.class));

                when(exerciseRepository.save(any(Exercise.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0, Exercise.class));

                when(exerciseOptionRepository.save(any(ExerciseOption.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0, ExerciseOption.class));

                when(acceptedAnswerRepository.save(any(ExerciseAcceptedAnswer.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0, ExerciseAcceptedAnswer.class));
        }

        private User buildUser(Long id, Role role) {
                User user = new User();
                user.setRole(role);
                setId(user, id);
                return user;
        }

        private Course buildCourse(Long id) {
                Course course = mock(Course.class);
                when(course.getId()).thenReturn(id);
                when(course.getTitle()).thenReturn("Course " + id);
                return course;
        }

        private CourseUnit buildUnit(Long id, Course course, String title, int displayOrder, boolean published) {
                CourseUnit unit = new CourseUnit();
                setId(unit, id);
                unit.setCourse(course);
                unit.setTitle(title);
                unit.setDisplayOrder(displayOrder);
                unit.setPublished(published);
                return unit;
        }

        private Lesson buildLesson(Long id, CourseUnit unit, String title, int displayOrder, boolean published) {
                Lesson lesson = new Lesson();
                setId(lesson, id);
                lesson.setUnit(unit);
                lesson.setTitle(title);
                lesson.setDisplayOrder(displayOrder);
                lesson.setPublished(published);
                return lesson;
        }

        private ContentImportRun buildRun(Long id) {
                ContentImportRun run = new ContentImportRun();
                setId(run, id);
                return run;
        }

        private ContentRestorePoint buildRestorePoint(Long id, Course course, User user) {
                ContentRestorePoint restorePoint = new ContentRestorePoint();
                setId(restorePoint, id);
                restorePoint.setCourse(course);
                restorePoint.setUser(user);
                restorePoint.setReason("IMPORT_REPLACE");
                return restorePoint;
        }

        private ContentImportRequest request(List<ContentImportRequest.UnitImport> units) {
                ContentImportRequest request = new ContentImportRequest();
                setField(request, "units", units);
                return request;
        }

        private ContentImportRequest.UnitImport unit(
                        String title,
                        String description,
                        Integer displayOrder,
                        List<ContentImportRequest.LessonImport> lessons) {
                ContentImportRequest.UnitImport unit = new ContentImportRequest.UnitImport();
                setField(unit, "title", title);
                setField(unit, "description", description);
                setField(unit, "displayOrder", displayOrder);
                setField(unit, "lessons", lessons);
                return unit;
        }

        private ContentImportRequest.LessonImport lesson(
                        String title,
                        String description,
                        Integer displayOrder,
                        List<ContentImportRequest.ContentBlockImport> contentBlocks,
                        List<ContentImportRequest.ExerciseImport> exercises) {
                ContentImportRequest.LessonImport lesson = new ContentImportRequest.LessonImport();
                setField(lesson, "title", title);
                setField(lesson, "description", description);
                setField(lesson, "displayOrder", displayOrder);
                setField(lesson, "contentBlocks", contentBlocks);
                setField(lesson, "exercises", exercises);
                return lesson;
        }

        private ContentImportRequest.ContentBlockImport block(String type, String content, Integer displayOrder) {
                ContentImportRequest.ContentBlockImport block = new ContentImportRequest.ContentBlockImport();
                setField(block, "type", type);
                setField(block, "content", content);
                setField(block, "displayOrder", displayOrder);
                return block;
        }

        private ContentImportRequest.ExerciseImport exercise(
                        String type,
                        String promptFr,
                        String correctAnswer,
                        Integer displayOrder,
                        List<ContentImportRequest.OptionImport> options,
                        List<String> acceptedAnswers) {
                ContentImportRequest.ExerciseImport exercise = new ContentImportRequest.ExerciseImport();
                setField(exercise, "type", type);
                setField(exercise, "promptFr", promptFr);
                setField(exercise, "correctAnswer", correctAnswer);
                setField(exercise, "displayOrder", displayOrder);
                setField(exercise, "options", options);
                setField(exercise, "acceptedAnswers", acceptedAnswers);
                return exercise;
        }

        private ContentImportRequest.OptionImport option(String text, Boolean correct, Integer displayOrder) {
                ContentImportRequest.OptionImport option = new ContentImportRequest.OptionImport();
                setField(option, "text", text);
                setField(option, "correct", correct);
                setField(option, "displayOrder", displayOrder);
                return option;
        }

        private static void setId(Object entity, Long id) {
                setField(entity, "id", id);
        }

        private static void setField(Object entity, String fieldName, Object value) {
                try {
                        var field = entity.getClass().getDeclaredField(fieldName);
                        field.setAccessible(true);
                        field.set(entity, value);
                } catch (Exception exception) {
                        throw new RuntimeException(exception);
                }
        }
}