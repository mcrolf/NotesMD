package com.notesmd.notes.exception;

/** Thrown when an operator has closed sign-ups with {@code REGISTRATION_ENABLED=false}. */
public class RegistrationDisabledException extends RuntimeException {

    public RegistrationDisabledException() {
        super("Registration is disabled on this server");
    }
}
