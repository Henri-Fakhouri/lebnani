package com.henri.lebnani.auth;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;

class AuthModelAndControllerTest {

    @Test
    void registerRequest_getters_expose_fields() {
        RegisterRequest request = new RegisterRequest();
        setField(request, "email", "test@email.com");
        setField(request, "password", "password");
        setField(request, "displayName", "Henri");

        assertThat(request.getEmail()).isEqualTo("test@email.com");
        assertThat(request.getPassword()).isEqualTo("password");
        assertThat(request.getDisplayName()).isEqualTo("Henri");
    }

    @Test
    void loginRequest_getters_expose_fields() {
        LoginRequest request = new LoginRequest();
        setField(request, "email", "test@email.com");
        setField(request, "password", "password");

        assertThat(request.getEmail()).isEqualTo("test@email.com");
        assertThat(request.getPassword()).isEqualTo("password");
    }

    @Test
    void registerResponse_getters_expose_fields() {
        RegisterResponse response = new RegisterResponse(1L, "test@email.com", "Henri");

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("test@email.com");
        assertThat(response.getDisplayName()).isEqualTo("Henri");
    }

    @Test
    void loginResponse_getters_expose_fields_and_bearer_token_type() {
        LoginResponse response = new LoginResponse(
                1L,
                "test@email.com",
                "Henri",
                "ADMIN",
                "jwt-token"
        );

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("test@email.com");
        assertThat(response.getDisplayName()).isEqualTo("Henri");
        assertThat(response.getRole()).isEqualTo("ADMIN");
        assertThat(response.getAccessToken()).isEqualTo("jwt-token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
    }

    @Test
    void authController_register_delegates_to_service() {
        AuthService authService = mock(AuthService.class);
        AuthController controller = new AuthController(authService);

        RegisterRequest request = new RegisterRequest();
        RegisterResponse response = new RegisterResponse(1L, "test@email.com", "Henri");

        when(authService.register(request)).thenReturn(response);

        RegisterResponse result = controller.register(request);

        assertThat(result).isEqualTo(response);
        verify(authService).register(request);
    }

    @Test
    void authController_login_delegates_to_service() {
        AuthService authService = mock(AuthService.class);
        AuthController controller = new AuthController(authService);

        LoginRequest request = new LoginRequest();
        LoginResponse response = new LoginResponse(
                1L,
                "test@email.com",
                "Henri",
                "LEARNER",
                "jwt-token"
        );

        when(authService.login(request)).thenReturn(response);

        LoginResponse result = controller.login(request);

        assertThat(result).isEqualTo(response);
        verify(authService).login(request);
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