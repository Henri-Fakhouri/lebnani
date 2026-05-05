package com.henri.lebnani;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.mockStatic;

@SpringBootTest
@ActiveProfiles("test")
class LebnaniApiApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that the Spring application context loads without errors.
    }

    @Test
    void main_starts_spring_application() {
        try (var mockedSpringApplication = mockStatic(SpringApplication.class)) {
            mockedSpringApplication.when(() ->
                    SpringApplication.run(LebnaniApiApplication.class, new String[]{"--test"})
            ).thenReturn(null);

            assertThatCode(() -> LebnaniApiApplication.main(new String[]{"--test"}))
                    .doesNotThrowAnyException();

            mockedSpringApplication.verify(() ->
                    SpringApplication.run(LebnaniApiApplication.class, new String[]{"--test"})
            );
        }
    }
}