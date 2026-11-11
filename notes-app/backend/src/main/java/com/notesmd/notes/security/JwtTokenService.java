package com.notesmd.notes.security;

import com.notesmd.notes.config.JwtProperties;
import com.notesmd.notes.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Set;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

    private static final String PLACEHOLDER_PREFIX = "CHANGE_ME";
    private static final Set<String> PUBLISHED_SECRETS =
            Set.of("local-dev-only-jwt-signing-key-not-for-production-use");

    private final JwtProperties props;
    private final SecretKey key;

    public JwtTokenService(JwtProperties props) {
        this.props = props;
        this.key = Keys.hmacShaKeyFor(usableSecretBytes(props.getSecret()));
    }

    public String createAccessToken(User user) {
        Instant now = Instant.now();
        Instant exp = now.plus(props.getAccessTokenTtl());
        return Jwts.builder()
                .subject(user.getId().toString())
                .issuer(props.getIssuer())
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .claim("username", user.getUsername())
                .signWith(key)
                .compact();
    }

    public Claims parseAndValidate(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(props.getIssuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long accessTokenTtlSeconds() {
        return props.getAccessTokenTtl().toSeconds();
    }

    /** Anyone who knows the secret can sign a token for any user id, so published values are refused. */
    private static byte[] usableSecretBytes(String secret) {
        if (secret.startsWith(PLACEHOLDER_PREFIX) || PUBLISHED_SECRETS.contains(secret)) {
            throw new IllegalStateException(
                    "JWT_SECRET is a published example value; generate one with: openssl rand -base64 48");
        }
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes (UTF-8) for HS256");
        }
        return bytes;
    }
}
