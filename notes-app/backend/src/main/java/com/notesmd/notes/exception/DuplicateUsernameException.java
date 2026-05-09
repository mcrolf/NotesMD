package com.notesmd.notes.exception;

/** Thrown when registering with a username that already exists. */
public class DuplicateUsernameException extends RuntimeException {

    public DuplicateUsernameException() {
        super("Username already taken");
    }
}
