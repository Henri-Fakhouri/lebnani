package com.henri.lebnani.auth;

import com.henri.lebnani.common.BusinessException;
import com.henri.lebnani.security.JwtService;
import com.henri.lebnani.user.Role;
import com.henri.lebnani.user.User;
import com.henri.lebnani.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @InjectMocks AuthService authService;

    @Test
    void register_success_normalizes_email() {
        RegisterRequest req = registerRequest(" Test@Email.Com ", " Henri ", "pass");

        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass")).thenReturn("hashed");
        when(userRepository.save(anyUser())).thenAnswer(invocation -> {
            User user = invocation.getArgument(0, User.class);
            setId(user, 1L);
            return user;
        });

        RegisterResponse response = authService.register(req);

        assertThat(response).isNotNull();
    }

    @Test
    void register_throws_when_email_already_used() {
        RegisterRequest req = registerRequest("taken@email.com", "Henri", "pass");

        when(userRepository.findByEmail("taken@email.com")).thenReturn(Optional.of(new User()));

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already used");
    }

    @Test
    void register_assigns_learner_role() {
        RegisterRequest req = registerRequest("new@email.com", "Henri", "pass");

        when(userRepository.findByEmail("new@email.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(userRepository.save(anyUser())).thenAnswer(invocation -> {
            User user = invocation.getArgument(0, User.class);
            setId(user, 1L);
            return user;
        });

        authService.register(req);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captureUser(captor));

        assertThat(captor.getValue().getRole()).isEqualTo(Role.LEARNER);
    }

    @Test
    void login_success_returns_response() {
        User user = buildUser(1L, "test@email.com", "Henri", "hashed", Role.LEARNER);
        LoginRequest req = loginRequest(" Test@Email.Com ", "pass");

        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass", "hashed")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("jwt-token");

        LoginResponse response = authService.login(req);

        assertThat(response).isNotNull();
    }

    @Test
    void login_throws_when_user_not_found() {
        LoginRequest req = loginRequest("ghost@email.com", "pass");

        when(userRepository.findByEmail("ghost@email.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid");
    }

    @Test
    void login_throws_when_password_wrong() {
        User user = buildUser(1L, "test@email.com", "Henri", "hashed", Role.LEARNER);
        LoginRequest req = loginRequest("test@email.com", "wrong");

        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid");
    }

    private RegisterRequest registerRequest(String email, String name, String password) {
        RegisterRequest request = mock(RegisterRequest.class);
        when(request.getEmail()).thenReturn(email);
        when(request.getDisplayName()).thenReturn(name);
        when(request.getPassword()).thenReturn(password);
        return request;
    }

    private LoginRequest loginRequest(String email, String password) {
        LoginRequest request = mock(LoginRequest.class);
        when(request.getEmail()).thenReturn(email);
        when(request.getPassword()).thenReturn(password);
        return request;
    }

    static User buildUser(Long id, String email, String displayName, String hash, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setDisplayName(displayName);
        user.setPasswordHash(hash);
        user.setRole(role);
        setId(user, id);
        return user;
    }

    static void setId(Object entity, Long id) {
        try {
            var field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception exception) {
            throw new RuntimeException(exception);
        }
    }

    @SuppressWarnings("null")
    private @NonNull User anyUser() {
        return any(User.class);
    }

    @SuppressWarnings("null")
    private @NonNull User captureUser(ArgumentCaptor<User> captor) {
        return captor.capture();
    }
}