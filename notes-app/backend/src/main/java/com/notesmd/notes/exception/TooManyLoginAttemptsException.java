package com.notesmd.notes.exception;

import java.time.Duration;

/** Thrown when failed logins for a client and username exceed the configured limit. */
public class TooManyLoginAttemptsException extends RuntimeException {

    private final Duration retryAfter;

    public TooManyLoginAttemptsException(Duration retryAfter) {
        super("Too many failed sign-in attempts; try again later");
        this.retryAfter = retryAfter;
    }

    public Duration getRetryAfter() {
        return retryAfter;
    }
}
