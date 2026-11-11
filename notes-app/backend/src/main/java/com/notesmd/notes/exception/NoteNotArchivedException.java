package com.notesmd.notes.exception;

import java.util.UUID;

/** Thrown when an operation needs an archived note (restore, delete) but the note is active. */
public class NoteNotArchivedException extends RuntimeException {

    public NoteNotArchivedException(UUID id) {
        super("Note is not archived; archive it first: " + id);
    }
}
