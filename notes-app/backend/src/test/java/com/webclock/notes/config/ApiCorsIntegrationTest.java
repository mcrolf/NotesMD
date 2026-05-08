package com.webclock.notes.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiCorsIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void preflightWithNullOrigin_reflectsElectronPackagedRenderer() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ORIGIN, "null");
        headers.add(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET");

        ResponseEntity<Void> res =
                restTemplate.exchange("/api/notes", HttpMethod.OPTIONS, new HttpEntity<>(headers), Void.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getHeaders().get(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN)).containsExactly("null");
        assertThat(res.getHeaders().getAccessControlAllowMethods())
                .anyMatch(ms -> ms.name().contains("GET"));
    }

    @Test
    void getNotesWithNullOriginIncludesAllowOrigin() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ORIGIN, "null");

        ResponseEntity<String> res =
                restTemplate.exchange("/api/notes", HttpMethod.GET, new HttpEntity<>(headers), String.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getHeaders().get(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN)).containsExactly("null");
    }
}
