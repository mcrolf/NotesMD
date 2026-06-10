package com.notesmd.notes.dto;

import com.notesmd.notes.entity.Note;
import java.time.Instant;
import java.util.UUID;

public record NoteResponse(
        UUID id,
        String title,
        String contentMarkdown,
        Instant createdAt,
        Instant updatedAt,
        Instant archivedAt) {

    public static NoteResponse from(Note note) {
        return new NoteResponse(
                note.getId(),
                note.getTitle(),
                note.getContentMarkdown(),
                note.getCreatedAt(),
                note.getUpdatedAt(),
                note.getArchivedAt());
    }
}
