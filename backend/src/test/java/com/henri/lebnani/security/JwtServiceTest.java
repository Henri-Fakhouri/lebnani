package com.henri.lebnani.security;

import com.henri.lebnani.user.Role;
import com.henri.lebnani.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtServiceTest {

    // Must be ≥ 256 bits for HS256
    private static final String SECRET = "test-secret-key-that-is-long-enough-for-hmac-sha256";
    private static final long EXPIRATION_MINUTES = 60;

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, EXPIRATION_MINUTES);

        user = mock(User.class);
        when(user.getEmail()).thenReturn("henri@test.com");
        when(user.getId()).thenReturn(1L);
        when(user.getDisplayName()).thenReturn("Henri");
        when(user.getRole()).thenReturn(Role.LEARNER);
    }

    @Test
    void generateToken_returns_non_blank_token() {
        assertThat(jwtService.generateToken(user)).isNotBlank();
    }

    @Test
    void extractEmail_returns_subject_from_token() {
        String token = jwtService.generateToken(user);
        assertThat(jwtService.extractEmail(token)).isEqualTo("henri@test.com");
    }

    @Test
    void isTokenValid_returns_true_for_valid_token() {
        String token = jwtService.generateToken(user);
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_throws_for_tampered_token() {
        String token = jwtService.generateToken(user) + "tampered";
        assertThatThrownBy(() -> jwtService.isTokenValid(token))
                .isInstanceOf(Exception.class);
    }

    @Test
    void isTokenValid_throws_for_expired_token() {
        JwtService shortLived = new JwtService(SECRET, -1); // expiration in the past
        String token = shortLived.generateToken(user);
        assertThatThrownBy(() -> jwtService.isTokenValid(token))
                .isInstanceOf(Exception.class);
    }

    @Test
    void tokens_from_different_secrets_are_not_cross_valid() {
        JwtService other = new JwtService("other-secret-key-long-enough-for-hmac-sha256-hashing", EXPIRATION_MINUTES);
        String token = other.generateToken(user);
        assertThatThrownBy(() -> jwtService.isTokenValid(token))
                .isInstanceOf(Exception.class);
    }
}