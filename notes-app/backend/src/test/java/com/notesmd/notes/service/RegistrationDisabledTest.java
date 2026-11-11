package com.notesmd.notes.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.notesmd.notes.dto.AuthCredentialsRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "app.auth.registration-enabled=false")
class RegistrationDisabledTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void register_whenDisabled_returns403() {
        ResponseEntity<String> res = restTemplate.postForEntity(
                "/api/auth/register", new AuthCredentialsRequest("closed-signup", "password12"), String.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(res.getBody()).contains("Registration is disabled");
    }
}
