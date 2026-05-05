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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SuppressWarnings("null")
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @InjectMocks AuthService authService;

    @Test
    void register_success_normalizes_email_trims_display_name_hashes_password_and_returns_response() {
        RegisterRequest request = registerRequest(" Test@Email.Com ", " Henri ", "pass");

        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0, User.class);
            setId(user, 1L);
            return user;
        });

        RegisterResponse response = authService.register(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("test@email.com");
        assertThat(response.getDisplayName()).isEqualTo("Henri");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User savedUser = captor.getValue();
        assertThat(savedUser.getEmail()).isEqualTo("test@email.com");
        assertThat(savedUser.getDisplayName()).isEqualTo("Henri");
        assertThat(savedUser.getPasswordHash()).isEqualTo("hashed");
        assertThat(savedUser.getRole()).isEqualTo(Role.LEARNER);
    }

    @Test
    void register_throws_when_email_already_used() {
        RegisterRequest request = registerRequest("taken@email.com", "Henri", "pass");

        when(userRepository.findByEmail("taken@email.com")).thenReturn(Optional.of(new User()));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already used");
    }

    @Test
    void login_success_normalizes_email_checks_password_generates_token_and_returns_response() {
        User user = buildUser(1L, "test@email.com", "Henri", "hashed", Role.LEARNER);
        LoginRequest request = loginRequest(" Test@Email.Com ", "pass");

        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass", "hashed")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("jwt-token");

        LoginResponse response = authService.login(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("test@email.com");
        assertThat(response.getDisplayName()).isEqualTo("Henri");
        assertThat(response.getRole()).isEqualTo("LEARNER");
        assertThat(response.getAccessToken()).isEqualTo("jwt-token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");

        verify(passwordEncoder).matches("pass", "hashed");
        verify(jwtService).generateToken(user);
    }

    @Test
    void login_throws_when_user_not_found() {
        LoginRequest request = loginRequest("ghost@email.com", "pass");

        when(userRepository.findByEmail("ghost@email.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid");
    }

    @Test
    void login_throws_when_password_wrong() {
        User user = buildUser(1L, "test@email.com", "Henri", "hashed", Role.LEARNER);
        LoginRequest request = loginRequest("test@email.com", "wrong");

        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid");
    }

    private RegisterRequest registerRequest(String email, String displayName, String password) {
        RegisterRequest request = new RegisterRequest();
        setField(request, "email", email);
        setField(request, "displayName", displayName);
        setField(request, "password", password);
        return request;
    }

    private LoginRequest loginRequest(String email, String password) {
        LoginRequest request = new LoginRequest();
        setField(request, "email", email);
        setField(request, "password", password);
        return request;
    }

    private User buildUser(Long id, String email, String displayName, String hash, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setDisplayName(displayName);
        user.setPasswordHash(hash);
        user.setRole(role);
        setId(user, id);
        return user;
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