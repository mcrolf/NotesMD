package com.notesmd.notes.entity;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import org.junit.jupiter.api.Test;

class UserTest {

    private static final Instant REVOKED_AT = Instant.parse("2026-11-17T12:00:00.750Z");

    @Test
    void acceptsAnyTokenUntilRevoked() {
        assertThat(new User().acceptsAccessTokenIssuedAt(Instant.EPOCH)).isTrue();
    }

    @Test
    void rejectsTokensIssuedWithinTheRevocationSecond() {
        User user = revokedUser();

        assertThat(user.acceptsAccessTokenIssuedAt(Instant.parse("2026-11-17T11:59:59Z"))).isFalse();
        assertThat(user.acceptsAccessTokenIssuedAt(Instant.parse("2026-11-17T12:00:00Z"))).isFalse();
    }

    @Test
    void acceptsTokensIssuedAfterTheRevocationSecond() {
        assertThat(revokedUser().acceptsAccessTokenIssuedAt(Instant.parse("2026-11-17T12:00:01Z"))).isTrue();
    }

    private static User revokedUser() {
        User user = new User();
        user.revokeAccessTokensIssuedUpTo(REVOKED_AT);
        return user;
    }
}
