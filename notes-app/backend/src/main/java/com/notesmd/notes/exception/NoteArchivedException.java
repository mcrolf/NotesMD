package com.notesmd.notes.exception;

/** Thrown when an operation needs an active note but the note is archived. */
public class NoteArchivedException extends RuntimeException {

    public NoteArchivedException() {
        super("Note is archived; restore it first");
    }
}
