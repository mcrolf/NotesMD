package com.notesmd.notes.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Access tokens issued at or before this instant are revoked; null when none are. */
    @Column(name = "tokens_valid_after")
    private Instant tokensValidAfter;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Revokes every access token issued up to {@code now}. JWT {@code iat} has whole-second precision, so the
     * cutoff is truncated to the second and a token issued within that second is revoked too.
     */
    public void revokeAccessTokensIssuedUpTo(Instant now) {
        tokensValidAfter = now.truncatedTo(ChronoUnit.SECONDS);
    }

    /** Whether an access token issued at {@code issuedAt} has not been revoked. */
    public boolean acceptsAccessTokenIssuedAt(Instant issuedAt) {
        return tokensValidAfter == null || issuedAt.isAfter(tokensValidAfter);
    }
}
