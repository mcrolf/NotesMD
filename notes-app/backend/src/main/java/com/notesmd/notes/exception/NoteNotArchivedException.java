package com.notesmd.notes.exception;

/** Thrown when an operation needs an archived note (restore, delete) but the note is active. */
public class NoteNotArchivedException extends RuntimeException {

    public NoteNotArchivedException() {
        super("Note is not archived; archive it first");
    }
}
