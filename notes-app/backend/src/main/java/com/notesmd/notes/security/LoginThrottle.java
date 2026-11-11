package com.notesmd.notes.security;

import com.notesmd.notes.config.AuthProperties;
import com.notesmd.notes.exception.TooManyLoginAttemptsException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Counts failed logins per client address and username in memory. After {@code loginMaxFailures} failures
 * inside one {@code loginLockout} window, further attempts are rejected until the window ends.
 *
 * <p>Counts reset on restart and are per instance. Behind a reverse proxy, set
 * {@code SERVER_FORWARD_HEADERS_STRATEGY=framework} so the client address is the caller, not the proxy.
 */
@Component
public class LoginThrottle {

    private static final int PURGE_THRESHOLD = 10_000;

    private final AuthProperties props;
    private final Clock clock;
    private final Map<String, FailureWindow> failuresByAttempt = new ConcurrentHashMap<>();

    @Autowired
    public LoginThrottle(AuthProperties props) {
        this(props, Clock.systemUTC());
    }

    LoginThrottle(AuthProperties props, Clock clock) {
        this.props = props;
        this.clock = clock;
    }

    public void checkAllowed(String clientAddress, String username) {
        FailureWindow window = failuresByAttempt.get(attemptKey(clientAddress, username));
        Instant now = clock.instant();
        if (window != null && !window.hasEnded(now, props.getLoginLockout())
                && window.failures() >= props.getLoginMaxFailures()) {
            throw new TooManyLoginAttemptsException(window.remaining(now, props.getLoginLockout()));
        }
    }

    public void recordFailure(String clientAddress, String username) {
        Instant now = clock.instant();
        if (failuresByAttempt.size() > PURGE_THRESHOLD) {
            failuresByAttempt.values().removeIf(window -> window.hasEnded(now, props.getLoginLockout()));
        }
        failuresByAttempt.compute(
                attemptKey(clientAddress, username),
                (key, window) -> window == null || window.hasEnded(now, props.getLoginLockout())
                        ? new FailureWindow(1, now)
                        : new FailureWindow(window.failures() + 1, window.start()));
    }

    public void recordSuccess(String clientAddress, String username) {
        failuresByAttempt.remove(attemptKey(clientAddress, username));
    }

    private static String attemptKey(String clientAddress, String username) {
        return clientAddress + '\n' + username;
    }

    private record FailureWindow(int failures, Instant start) {

        boolean hasEnded(Instant now, Duration lockout) {
            return !now.isBefore(start.plus(lockout));
        }

        Duration remaining(Instant now, Duration lockout) {
            return Duration.between(now, start.plus(lockout));
        }
    }
}
