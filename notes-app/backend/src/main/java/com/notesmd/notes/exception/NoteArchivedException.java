package com.notesmd.notes.exception;

import java.util.UUID;

/** Thrown when an operation needs an active note but the note is archived. */
public class NoteArchivedException extends RuntimeException {

    public NoteArchivedException(UUID id) {
        super("Note is archived; restore it first: " + id);
    }
}
