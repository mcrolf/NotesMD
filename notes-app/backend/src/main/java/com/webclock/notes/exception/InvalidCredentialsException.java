package com.webclock.notes.exception;

/** Thrown when login credentials are invalid (generic handling; do not leak existence). */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid username or password");
    }
}
