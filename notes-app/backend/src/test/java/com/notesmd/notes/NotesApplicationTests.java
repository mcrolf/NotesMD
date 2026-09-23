package com.notesmd.notes;

import static org.assertj.core.api.Assertions.assertThat;

import com.notesmd.notes.dto.AuthCredentialsRequest;
import com.notesmd.notes.dto.AuthRegisterResponse;
import com.notesmd.notes.dto.DeleteAccountRequest;
import com.notesmd.notes.dto.LoginResponse;
import com.notesmd.notes.dto.NoteCreateRequest;
import com.notesmd.notes.dto.NoteResponse;
import com.notesmd.notes.dto.NoteUpdateRequest;
import com.notesmd.notes.repository.NoteRepository;
import com.notesmd.notes.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class NotesApplicationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void contextLoads() {}

    @Test
    void notesWithoutToken_returns401() {
        ResponseEntity<String> res = restTemplate.getForEntity("/api/notes", String.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void crudRoundTrip() {
        String username = "user-" + UUID.randomUUID();
        String password = "password12";

        ResponseEntity<AuthRegisterResponse> registered = restTemplate.postForEntity(
                "/api/auth/register", new AuthCredentialsRequest(username, password), AuthRegisterResponse.class);
        assertThat(registered.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(registered.getBody()).isNotNull();

        ResponseEntity<LoginResponse> login = restTemplate.postForEntity(
                "/api/auth/login", new AuthCredentialsRequest(username, password), LoginResponse.class);
        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(login.getBody()).isNotNull();
        String accessToken = login.getBody().accessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        ResponseEntity<NoteResponse> created = restTemplate.exchange(
                "/api/notes",
                HttpMethod.POST,
                new HttpEntity<>(new NoteCreateRequest("Hi", "## body"), headers),
                NoteResponse.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(created.getBody()).isNotNull();
        assertThat(created.getBody().title()).isEqualTo("Hi");

        var id = created.getBody().id();
        ResponseEntity<NoteResponse> got =
                restTemplate.exchange("/api/notes/" + id, HttpMethod.GET, new HttpEntity<>(headers), NoteResponse.class);
        assertThat(got.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(got.getBody()).isNotNull();
        assertThat(got.getBody().contentMarkdown()).isEqualTo("## body");

        ResponseEntity<Void> archived = restTemplate.exchange(
                "/api/notes/" + id + "/archive", HttpMethod.POST, new HttpEntity<>(headers), Void.class);
        assertThat(archived.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(noteRepository.findById(id)).isPresent();
        assertThat(noteRepository.findById(id).orElseThrow().isArchived()).isTrue();

        ResponseEntity<List<NoteResponse>> activeList = restTemplate.exchange(
                "/api/notes",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<List<NoteResponse>>() {});
        assertThat(activeList.getBody()).isEmpty();

        ResponseEntity<List<NoteResponse>> archivedList = restTemplate.exchange(
                "/api/notes/archived",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<List<NoteResponse>>() {});
        assertThat(archivedList.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(archivedList.getBody()).extracting(NoteResponse::id).containsExactly(id);
        assertThat(archivedList.getBody()).extracting(NoteResponse::archivedAt).allMatch(at -> at != null);

        ResponseEntity<NoteResponse> restored = restTemplate.exchange(
                "/api/notes/" + id + "/restore", HttpMethod.POST, new HttpEntity<>(headers), NoteResponse.class);
        assertThat(restored.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(restored.getBody()).isNotNull();
        assertThat(restored.getBody().archivedAt()).isNull();

        ResponseEntity<List<NoteResponse>> activeAgain = restTemplate.exchange(
                "/api/notes",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<List<NoteResponse>>() {});
        assertThat(activeAgain.getBody()).extracting(NoteResponse::id).containsExactly(id);

        restTemplate.exchange("/api/notes/" + id + "/archive", HttpMethod.POST, new HttpEntity<>(headers), Void.class);

        ResponseEntity<Void> deleted =
                restTemplate.exchange("/api/notes/" + id, HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
        assertThat(deleted.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(noteRepository.findById(id)).isEmpty();
    }

    @Test
    void archiveActiveNote_setsArchivedAtAndRemovesFromActiveList() {
        String username = "archive-" + UUID.randomUUID();
        String password = "password12";
        HttpHeaders headers = authHeaders(registerAndLogin(username, password));

        ResponseEntity<NoteResponse> created = restTemplate.exchange(
                "/api/notes",
                HttpMethod.POST,
                new HttpEntity<>(new NoteCreateRequest("To archive", "content"), headers),
                NoteResponse.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(created.getBody()).isNotNull();
        UUID id = created.getBody().id();

        ResponseEntity<Void> archived = restTemplate.exchange(
                "/api/notes/" + id + "/archive", HttpMethod.POST, new HttpEntity<>(headers), Void.class);
        assertThat(archived.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        ResponseEntity<NoteResponse> got =
                restTemplate.exchange("/api/notes/" + id, HttpMethod.GET, new HttpEntity<>(headers), NoteResponse.class);
        assertThat(got.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(got.getBody()).isNotNull();
        assertThat(got.getBody().archivedAt()).isNotNull();

        ResponseEntity<List<NoteResponse>> activeList = restTemplate.exchange(
                "/api/notes",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<List<NoteResponse>>() {});
        assertThat(activeList.getBody()).isEmpty();
    }

    @Test
    void patchArchivedNote_returns404() {
        String username = "patch-archived-" + UUID.randomUUID();
        String password = "password12";
        HttpHeaders headers = authHeaders(registerAndLogin(username, password));

        ResponseEntity<NoteResponse> created = restTemplate.exchange(
                "/api/notes",
                HttpMethod.POST,
                new HttpEntity<>(new NoteCreateRequest("Locked", "body"), headers),
                NoteResponse.class);
        assertThat(created.getBody()).isNotNull();
        UUID id = created.getBody().id();

        restTemplate.exchange("/api/notes/" + id + "/archive", HttpMethod.POST, new HttpEntity<>(headers), Void.class);

        ResponseEntity<String> patched = restTemplate.exchange(
                "/api/notes/" + id,
                HttpMethod.PATCH,
                new HttpEntity<>(new NoteUpdateRequest("Changed", null), headers),
                String.class);
        assertThat(patched.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(patched.getBody()).contains("Note not found");
    }

    @Test
    void deleteActiveNote_returns404() {
        String username = "delete-active-" + UUID.randomUUID();
        String password = "password12";
        HttpHeaders headers = authHeaders(registerAndLogin(username, password));

        ResponseEntity<NoteResponse> created = restTemplate.exchange(
                "/api/notes",
                HttpMethod.POST,
                new HttpEntity<>(new NoteCreateRequest("Still active", "body"), headers),
                NoteResponse.class);
        assertThat(created.getBody()).isNotNull();
        UUID id = created.getBody().id();

        ResponseEntity<String> deleted = restTemplate.exchange(
                "/api/notes/" + id, HttpMethod.DELETE, new HttpEntity<>(headers), String.class);
        assertThat(deleted.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(deleted.getBody()).contains("Note not found");
        assertThat(noteRepository.findById(id)).isPresent();
        assertThat(noteRepository.findById(id).orElseThrow().isArchived()).isFalse();
    }

    @Test
    void crossTenantArchive_returns404() {
        String password = "password12";
        String userA = "user-a-archive-" + UUID.randomUUID();
        String userB = "user-b-archive-" + UUID.randomUUID();

        HttpHeaders headersA = authHeaders(registerAndLogin(userA, password));
        HttpHeaders headersB = authHeaders(registerAndLogin(userB, password));

        ResponseEntity<NoteResponse> created = restTemplate.exchange(
                "/api/notes",
                HttpMethod.POST,
                new HttpEntity<>(new NoteCreateRequest("Owned by A", "secret"), headersA),
                NoteResponse.class);
        assertThat(created.getBody()).isNotNull();
        UUID noteId = created.getBody().id();

        ResponseEntity<String> archived = restTemplate.exchange(
                "/api/notes/" + noteId + "/archive", HttpMethod.POST, new HttpEntity<>(headersB), String.class);
        assertThat(archived.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(archived.getBody()).contains("Note not found");

        assertThat(noteRepository.findById(noteId)).isPresent();
        assertThat(noteRepository.findById(noteId).orElseThrow().isArchived()).isFalse();
    }

    @Test
    void listNotes_onlyReturnsNotesForCurrentUser() {
        String password = "password12";
        String userA = "user-a-list-" + UUID.randomUUID();
        String userB = "user-b-list-" + UUID.randomUUID();

        restTemplate.postForEntity(
                "/api/auth/register", new AuthCredentialsRequest(userA, password), AuthRegisterResponse.class);
        ResponseEntity<LoginResponse> loginA = restTemplate.postForEntity(
                "/api/auth/login", new AuthCredentialsRequest(userA, password), LoginResponse.class);
        assertThat(loginA.getBody()).isNotNull();
        HttpHeaders headersA = new HttpHeaders();
        headersA.setBearerAuth(loginA.getBody().accessToken());

        restTemplate.exchange(
                "/api/notes",
                HttpMethod.POST,
                new HttpEntity<>(new NoteCreateRequest("A only", "a"), headersA),
                NoteResponse.class);

        restTemplate.postForEntity(
                "/api/auth/register", new AuthCredentialsRequest(userB, password), AuthRegisterResponse.class);
        ResponseEntity<LoginResponse> loginB = restTemplate.postForEntity(
                "/api/auth/login", new AuthCredentialsRequest(userB, password), LoginResponse.class);
        assertThat(loginB.getBody()).isNotNull();
        HttpHeaders headersB = new HttpHeaders();
        headersB.setBearerAuth(loginB.getBody().accessToken());

        restTemplate.exchange(
                "/api/notes",
                HttpMethod.POST,
                new HttpEntity<>(new NoteCreateRequest("B only", "b"), headersB),
                NoteResponse.class);

        ResponseEntity<List<NoteResponse>> listA = restTemplate.exchange(
                "/api/notes",
                HttpMethod.GET,
                new HttpEntity<>(headersA),
                new ParameterizedTypeReference<List<NoteResponse>>() {});

        ResponseEntity<List<NoteResponse>> listB = restTemplate.exchange(
                "/api/notes",
                HttpMethod.GET,
                new HttpEntity<>(headersB),
                new ParameterizedTypeReference<List<NoteResponse>>() {});

        assertThat(listA.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listB.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listA.getBody()).extracting(NoteResponse::title).containsExactly("A only");
        assertThat(listB.getBody()).extracting(NoteResponse::title).containsExactly("B only");
    }

    @Test
    void loginWithBadPassword_returns401() {
        String username = "bad-pw-" + UUID.randomUUID();
        restTemplate.postForEntity(
                "/api/auth/register", new AuthCredentialsRequest(username, "password12"), AuthRegisterResponse.class);

        ResponseEntity<String> res = restTemplate.postForEntity(
                "/api/auth/login",
                new AuthCredentialsRequest(username, "wrong-password"),
                String.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(res.getBody()).contains("Invalid username or password");
    }

    @Test
    void registerDuplicateUsername_returns409() {
        String username = "dup-" + UUID.randomUUID();
        String password = "password12";
        restTemplate.postForEntity(
                "/api/auth/register", new AuthCredentialsRequest(username, password), AuthRegisterResponse.class);

        ResponseEntity<String> again = restTemplate.postForEntity(
                "/api/auth/register", new AuthCredentialsRequest(username, password), String.class);

        assertThat(again.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(again.getBody()).contains("Username already taken");
    }

    @Test
    void crossTenantNoteAccess_returns404() {
        String password = "password12";
        String userA = "user-a-" + UUID.randomUUID();
        String userB = "user-b-" + UUID.randomUUID();

        restTemplate.postForEntity(
                "/api/auth/register", new AuthCredentialsRequest(userA, password), AuthRegisterResponse.class);
        ResponseEntity<LoginResponse> loginA = restTemplate.postForEntity(
                "/api/auth/login", new AuthCredentialsRequest(userA, password), LoginResponse.class);
        assertThat(loginA.getBody()).isNotNull();
        HttpHeaders headersA = new HttpHeaders();
        headersA.setBearerAuth(loginA.getBody().accessToken());

        ResponseEntity<NoteResponse> created = restTemplate.exchange(
                "/api/notes",
                HttpMethod.POST,
                new HttpEntity<>(new NoteCreateRequest("Secret", "owned by A"), headersA),
                NoteResponse.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(created.getBody()).isNotNull();
        UUID noteId = created.getBody().id();

        restTemplate.postForEntity(
                "/api/auth/register", new AuthCredentialsRequest(userB, password), AuthRegisterResponse.class);
        ResponseEntity<LoginResponse> loginB = restTemplate.postForEntity(
                "/api/auth/login", new AuthCredentialsRequest(userB, password), LoginResponse.class);
        assertThat(loginB.getBody()).isNotNull();
        HttpHeaders headersB = new HttpHeaders();
        headersB.setBearerAuth(loginB.getBody().accessToken());

        ResponseEntity<String> got = restTemplate.exchange(
                "/api/notes/" + noteId, HttpMethod.GET, new HttpEntity<>(headersB), String.class);
        assertThat(got.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(got.getBody()).contains("Note not found");

        ResponseEntity<String> patched = restTemplate.exchange(
                "/api/notes/" + noteId,
                HttpMethod.PATCH,
                new HttpEntity<>(new NoteUpdateRequest("Hacked", null), headersB),
                String.class);
        assertThat(patched.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

        ResponseEntity<Void> deleted =
                restTemplate.exchange("/api/notes/" + noteId, HttpMethod.DELETE, new HttpEntity<>(headersB), Void.class);
        assertThat(deleted.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

        assertThat(noteRepository.findById(noteId)).isPresent();
    }

    @Test
    void notFound_returns404Payload() {
        String username = "nf-" + UUID.randomUUID();
        String password = "password12";
        restTemplate.postForEntity(
                "/api/auth/register", new AuthCredentialsRequest(username, password), AuthRegisterResponse.class);
        ResponseEntity<LoginResponse> login = restTemplate.postForEntity(
                "/api/auth/login", new AuthCredentialsRequest(username, password), LoginResponse.class);
        assertThat(login.getBody()).isNotNull();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(login.getBody().accessToken());

        java.util.UUID random = java.util.UUID.randomUUID();
        ResponseEntity<String> res = restTemplate.exchange(
                "/api/notes/" + random, HttpMethod.GET, new HttpEntity<>(headers), String.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(res.getBody()).contains("Note not found");
    }

    @Test
    void healthIsUp() {
        ResponseEntity<String> res = restTemplate.getForEntity("/actuator/health", String.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void deleteAccount_withoutToken_returns401() {
        ResponseEntity<String> res = restTemplate.exchange(
                "/api/auth/account",
                HttpMethod.DELETE,
                new HttpEntity<>(new DeleteAccountRequest(DeleteAccountRequest.REQUIRED_PHRASE)),
                String.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void deleteAccount_wrongConfirmation_returns400() {
        String token = registerAndLogin("del-confirm-" + UUID.randomUUID(), "password12");
        HttpHeaders headers = authHeaders(token);

        ResponseEntity<String> res = restTemplate.exchange(
                "/api/auth/account",
                HttpMethod.DELETE,
                new HttpEntity<>(new DeleteAccountRequest("please delete"), headers),
                String.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(res.getBody()).contains("Validation failed");
    }

    @Test
    void deleteAccount_removesUserNotesAndArchives_leavesOtherUsersIntact() {
        String password = "password12";
        String userA = "del-a-" + UUID.randomUUID();
        String userB = "del-b-" + UUID.randomUUID();

        ResponseEntity<AuthRegisterResponse> registeredA = restTemplate.postForEntity(
                "/api/auth/register", new AuthCredentialsRequest(userA, password), AuthRegisterResponse.class);
        assertThat(registeredA.getBody()).isNotNull();
        UUID userAId = registeredA.getBody().userId();
        HttpHeaders headersA = authHeaders(login(userA, password));
        HttpHeaders headersB = authHeaders(registerAndLogin(userB, password));

        ResponseEntity<NoteResponse> active = restTemplate.exchange(
                "/api/notes",
                HttpMethod.POST,
                new HttpEntity<>(new NoteCreateRequest("A active", "keep secret"), headersA),
                NoteResponse.class);
        assertThat(active.getBody()).isNotNull();
        UUID activeId = active.getBody().id();

        ResponseEntity<NoteResponse> archived = restTemplate.exchange(
                "/api/notes",
                HttpMethod.POST,
                new HttpEntity<>(new NoteCreateRequest("A archived", "also secret"), headersA),
                NoteResponse.class);
        assertThat(archived.getBody()).isNotNull();
        UUID archivedId = archived.getBody().id();
        restTemplate.exchange(
                "/api/notes/" + archivedId + "/archive", HttpMethod.POST, new HttpEntity<>(headersA), Void.class);

        ResponseEntity<NoteResponse> other = restTemplate.exchange(
                "/api/notes",
                HttpMethod.POST,
                new HttpEntity<>(new NoteCreateRequest("B stays", "b"), headersB),
                NoteResponse.class);
        assertThat(other.getBody()).isNotNull();
        UUID otherId = other.getBody().id();

        ResponseEntity<Void> deleted = restTemplate.exchange(
                "/api/auth/account",
                HttpMethod.DELETE,
                new HttpEntity<>(new DeleteAccountRequest(DeleteAccountRequest.REQUIRED_PHRASE), headersA),
                Void.class);
        assertThat(deleted.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        assertThat(userRepository.findById(userAId)).isEmpty();
        assertThat(noteRepository.findById(activeId)).isEmpty();
        assertThat(noteRepository.findById(archivedId)).isEmpty();
        assertThat(noteRepository.findById(otherId)).isPresent();

        ResponseEntity<String> loginAgain = restTemplate.postForEntity(
                "/api/auth/login", new AuthCredentialsRequest(userA, password), String.class);
        assertThat(loginAgain.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    // Registers a user and returns a bearer token for authenticated API calls
    private String registerAndLogin(String username, String password) {
        restTemplate.postForEntity(
                "/api/auth/register", new AuthCredentialsRequest(username, password), AuthRegisterResponse.class);
        return login(username, password);
    }

    private String login(String username, String password) {
        ResponseEntity<LoginResponse> login = restTemplate.postForEntity(
                "/api/auth/login", new AuthCredentialsRequest(username, password), LoginResponse.class);
        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(login.getBody()).isNotNull();
        return login.getBody().accessToken();
    }

    private HttpHeaders authHeaders(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        return headers;
    }
}
