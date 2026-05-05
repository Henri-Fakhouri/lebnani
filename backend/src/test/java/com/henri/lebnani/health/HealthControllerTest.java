package com.henri.lebnani.health;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class HealthControllerTest {

    @Test
    void health_returns_status_application_and_timestamp() {
        HealthController controller = new HealthController();

        Map<String, Object> response = controller.health();

        assertThat(response)
                .containsEntry("status", "OK")
                .containsEntry("application", "lebnani-api");

        assertThat(response.get("timestamp")).isInstanceOf(String.class);
        assertThat((String) response.get("timestamp")).isNotBlank();
    }
}