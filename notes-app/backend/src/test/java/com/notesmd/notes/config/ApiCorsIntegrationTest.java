package com.notesmd.notes.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.notesmd.notes.dto.AuthCredentialsRequest;
import com.notesmd.notes.dto.LoginResponse;
import java.util.UUID;
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

    /** Default Vite dev origin; keep in sync with {@link CorsProperties} / {@code CORS_ALLOWED_ORIGINS}. */
    private static final String FRONTEND_VITE_ORIGIN = "http://localhost:5173";

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

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(res.getHeaders().get(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN)).containsExactly("null");
    }

    @Test
    void preflightWithViteOrigin_reflectsFrontendDevServer() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ORIGIN, FRONTEND_VITE_ORIGIN);
        headers.add(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET");

        ResponseEntity<Void> res =
                restTemplate.exchange("/api/notes", HttpMethod.OPTIONS, new HttpEntity<>(headers), Void.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getHeaders().get(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN))
                .containsExactly(FRONTEND_VITE_ORIGIN);
        assertThat(res.getHeaders().getAccessControlAllowMethods())
                .anyMatch(ms -> ms.name().contains("GET"));
    }

    @Test
    void getNotesWithViteOriginIncludesAllowOrigin() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ORIGIN, FRONTEND_VITE_ORIGIN);

        ResponseEntity<String> res =
                restTemplate.exchange("/api/notes", HttpMethod.GET, new HttpEntity<>(headers), String.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(res.getHeaders().get(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN))
                .containsExactly(FRONTEND_VITE_ORIGIN);
    }

    @Test
    void loginPostWithViteOriginIncludesAllowOrigin() {
        String username = "cors-login-" + UUID.randomUUID();
        restTemplate.postForEntity(
                "/api/auth/register", new AuthCredentialsRequest(username, "password12"), Void.class);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ORIGIN, FRONTEND_VITE_ORIGIN);

        ResponseEntity<LoginResponse> res = restTemplate.exchange(
                "/api/auth/login",
                HttpMethod.POST,
                new HttpEntity<>(new AuthCredentialsRequest(username, "password12"), headers),
                LoginResponse.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getHeaders().get(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN))
                .containsExactly(FRONTEND_VITE_ORIGIN);
    }

    @Test
    void getActuatorHealthWithViteOriginIncludesAllowOrigin() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ORIGIN, FRONTEND_VITE_ORIGIN);

        ResponseEntity<String> res = restTemplate.exchange(
                "/actuator/health", HttpMethod.GET, new HttpEntity<>(headers), String.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).contains("\"status\":\"UP\"");
        assertThat(res.getHeaders().get(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN))
                .containsExactly(FRONTEND_VITE_ORIGIN);
    }

    @Test
    void preflightActuatorHealthWithViteOrigin_reflectsFrontendDevServer() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ORIGIN, FRONTEND_VITE_ORIGIN);
        headers.add(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET");

        ResponseEntity<Void> res = restTemplate.exchange(
                "/actuator/health", HttpMethod.OPTIONS, new HttpEntity<>(headers), Void.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getHeaders().get(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN))
                .containsExactly(FRONTEND_VITE_ORIGIN);
        assertThat(res.getHeaders().getAccessControlAllowMethods())
                .anyMatch(ms -> ms.name().contains("GET"));
    }

    @Test
    void disallowedOriginDoesNotEchoAccessControlAllowOrigin() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ORIGIN, "https://untrusted.example");

        ResponseEntity<String> res =
                restTemplate.exchange("/api/notes", HttpMethod.GET, new HttpEntity<>(headers), String.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(res.getHeaders().get(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN)).isNull();
    }
}
