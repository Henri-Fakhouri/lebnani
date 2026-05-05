package com.henri.lebnani.user;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserModelAndControllerTest {

    @Test
    void user_getters_and_setters_work() {
        User user = new User();
        setId(user, 1L);

        user.setEmail("test@email.com");
        user.setPasswordHash("hashed-password");
        user.setDisplayName("Henri");
        user.setRole(Role.ADMIN);

        assertThat(user.getId()).isEqualTo(1L);
        assertThat(user.getEmail()).isEqualTo("test@email.com");
        assertThat(user.getPasswordHash()).isEqualTo("hashed-password");
        assertThat(user.getDisplayName()).isEqualTo("Henri");
        assertThat(user.getRole()).isEqualTo(Role.ADMIN);
        assertThat(user.getCreatedAt()).isNotNull();
    }

    @Test
    void currentUserResponse_exposes_fields() {
        CurrentUserResponse response = new CurrentUserResponse(
                1L,
                "test@email.com",
                "Henri",
                "ADMIN"
        );

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("test@email.com");
        assertThat(response.getDisplayName()).isEqualTo("Henri");
        assertThat(response.getRole()).isEqualTo("ADMIN");
    }

    @Test
    void userController_me_maps_authenticated_user() {
        User user = new User();
        setId(user, 1L);
        user.setEmail("test@email.com");
        user.setDisplayName("Henri");
        user.setRole(Role.CONTENT_EDITOR);

        UserController controller = new UserController();

        CurrentUserResponse response = controller.me(user);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("test@email.com");
        assertThat(response.getDisplayName()).isEqualTo("Henri");
        assertThat(response.getRole()).isEqualTo("CONTENT_EDITOR");
    }

    @Test
    void role_values_are_available() {
        assertThat(Role.valueOf("LEARNER")).isEqualTo(Role.LEARNER);
        assertThat(Role.valueOf("CONTENT_EDITOR")).isEqualTo(Role.CONTENT_EDITOR);
        assertThat(Role.valueOf("ADMIN")).isEqualTo(Role.ADMIN);
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