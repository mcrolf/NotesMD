package com.notesmd.notes.security;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.notesmd.notes.config.JwtProperties;
import org.junit.jupiter.api.Test;

class JwtTokenServiceTest {

    @Test
    void rejectsEnvExamplePlaceholder() {
        assertThatThrownBy(() -> new JwtTokenService(propsWithSecret("CHANGE_ME_generate_with_openssl_rand_base64_48")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("published");
    }

    @Test
    void rejectsFormerDevelopmentDefault() {
        assertThatThrownBy(() -> new JwtTokenService(propsWithSecret("local-dev-only-jwt-signing-key-not-for-production-use")))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void rejectsShortSecret() {
        assertThatThrownBy(() -> new JwtTokenService(propsWithSecret("too-short")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("32 bytes");
    }

    @Test
    void acceptsGeneratedSecret() {
        assertThatCode(() -> new JwtTokenService(propsWithSecret("q8N3v0Yk2mZ7rP1sT4wX6bC9dF5gH0jL2nQ7uV3yA8eK")))
                .doesNotThrowAnyException();
    }

    private static JwtProperties propsWithSecret(String secret) {
        JwtProperties props = new JwtProperties();
        props.setSecret(secret);
        return props;
    }
}
