package com.webclock.notes.exception;

import java.util.UUID;

/** Thrown when a note id does not exist. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(UUID id) {
        super("Note not found: " + id);
    }
}
