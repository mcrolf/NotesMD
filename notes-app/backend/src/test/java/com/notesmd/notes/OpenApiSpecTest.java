package com.notesmd.notes;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;

/**
 * Keeps {@code NotesMD/docs/openapi.json} (the contract the app generates its types from) in step with the code.
 * Regenerate with {@code UPDATE_OPENAPI_SPEC=true ./gradlew test --tests '*OpenApiSpecTest'}.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OpenApiSpecTest {

    private static final Path SPEC_FILE = Path.of("../../docs/openapi.json");

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void checkedInSpecMatchesApi() throws Exception {
        JsonNode live = withoutServers(objectMapper.readTree(restTemplate.getForObject("/v3/api-docs", String.class)));

        if (Boolean.parseBoolean(System.getenv("UPDATE_OPENAPI_SPEC"))) {
            Files.writeString(SPEC_FILE, objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(live) + "\n");
        }

        assertThat(Files.exists(SPEC_FILE))
                .as("Missing %s; run with UPDATE_OPENAPI_SPEC=true", SPEC_FILE)
                .isTrue();
        assertThat(objectMapper.readTree(Files.readString(SPEC_FILE)))
                .as("docs/openapi.json is stale; run with UPDATE_OPENAPI_SPEC=true")
                .isEqualTo(live);
    }

    /** The test server's random port is not part of the contract. */
    private static JsonNode withoutServers(JsonNode spec) {
        ((ObjectNode) spec).remove("servers");
        return spec;
    }
}
