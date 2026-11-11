package com.notesmd.notes.security;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.notesmd.notes.config.AuthProperties;
import com.notesmd.notes.exception.TooManyLoginAttemptsException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class LoginThrottleTest {

    private static final String CLIENT = "203.0.113.7";

    private final MutableClock clock = new MutableClock(Instant.parse("2026-11-11T12:00:00Z"));
    private LoginThrottle throttle;

    @BeforeEach
    void setUp() {
        AuthProperties props = new AuthProperties();
        props.setLoginMaxFailures(3);
        props.setLoginLockout(Duration.ofMinutes(15));
        throttle = new LoginThrottle(props, clock);
    }

    @Test
    void locksAfterMaxFailures() {
        failTimes(3, "alice");

        assertThatThrownBy(() -> throttle.checkAllowed(CLIENT, "alice"))
                .isInstanceOf(TooManyLoginAttemptsException.class);
    }

    @Test
    void otherUsernamesAndClientsAreNotLocked() {
        failTimes(3, "alice");

        assertThatCode(() -> throttle.checkAllowed(CLIENT, "bob")).doesNotThrowAnyException();
        assertThatCode(() -> throttle.checkAllowed("198.51.100.1", "alice")).doesNotThrowAnyException();
    }

    @Test
    void unlocksWhenWindowEnds() {
        failTimes(3, "alice");
        clock.advance(Duration.ofMinutes(15));

        assertThatCode(() -> throttle.checkAllowed(CLIENT, "alice")).doesNotThrowAnyException();
    }

    @Test
    void successResetsFailures() {
        failTimes(2, "alice");
        throttle.recordSuccess(CLIENT, "alice");
        failTimes(2, "alice");

        assertThatCode(() -> throttle.checkAllowed(CLIENT, "alice")).doesNotThrowAnyException();
    }

    private void failTimes(int times, String username) {
        for (int i = 0; i < times; i++) {
            throttle.recordFailure(CLIENT, username);
        }
    }

    private static final class MutableClock extends Clock {

        private Instant now;

        MutableClock(Instant now) {
            this.now = now;
        }

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public Instant instant() {
            return now;
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }
    }
}
