package com.notesmd.notes.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.notesmd.notes.dto.AuthCredentialsRequest;
import com.notesmd.notes.dto.LoginResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SignOutEverywhereTest {

    private static final AuthCredentialsRequest CREDENTIALS =
            new AuthCredentialsRequest("sign-out-everywhere", "password12");

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void revokesEveryTokenIssuedBeforeTheRequest() {
        restTemplate.postForEntity("/api/auth/register", CREDENTIALS, String.class);
        String firstDevice = signIn();
        String secondDevice = signIn();

        var signOut = restTemplate.exchange(
                "/api/auth/sign-out-everywhere", HttpMethod.POST, bearer(firstDevice), Void.class);

        assertThat(signOut.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(listNotesStatus(firstDevice)).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(listNotesStatus(secondDevice)).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void requiresAnAccessToken() {
        var res = restTemplate.postForEntity("/api/auth/sign-out-everywhere", null, String.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    private String signIn() {
        return restTemplate
                .postForObject("/api/auth/login", CREDENTIALS, LoginResponse.class)
                .accessToken();
    }

    private HttpStatus listNotesStatus(String accessToken) {
        return HttpStatus.valueOf(restTemplate
                .exchange("/api/notes", HttpMethod.GET, bearer(accessToken), String.class)
                .getStatusCode()
                .value());
    }

    private static HttpEntity<Void> bearer(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        return new HttpEntity<>(headers);
    }
}
