package com.webclock.notes;

import static org.assertj.core.api.Assertions.assertThat;

import com.webclock.notes.dto.NoteCreateRequest;
import com.webclock.notes.dto.NoteResponse;
import com.webclock.notes.repository.NoteRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class NotesApplicationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private NoteRepository noteRepository;

    @Test
    void contextLoads() {}

    @Test
    void crudRoundTrip() {
        ResponseEntity<NoteResponse> created =
                restTemplate.postForEntity("/api/notes", new NoteCreateRequest("Hi", "## body"), NoteResponse.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(created.getBody()).isNotNull();
        assertThat(created.getBody().title()).isEqualTo("Hi");

        var id = created.getBody().id();
        ResponseEntity<NoteResponse> got = restTemplate.getForEntity("/api/notes/" + id, NoteResponse.class);
        assertThat(got.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(got.getBody()).isNotNull();
        assertThat(got.getBody().contentMarkdown()).isEqualTo("## body");

        restTemplate.delete("/api/notes/" + id);
        assertThat(noteRepository.findById(id)).isEmpty();
    }

    @Test
    void notFound_returns404Payload() {
        java.util.UUID random = java.util.UUID.randomUUID();
        ResponseEntity<String> res = restTemplate.getForEntity("/api/notes/" + random, String.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(res.getBody()).contains("Note not found");
    }

    @Test
    void healthIsUp() {
        ResponseEntity<String> res = restTemplate.getForEntity("/actuator/health", String.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
