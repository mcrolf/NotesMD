package com.webclock.notes.dto;

import com.webclock.notes.entity.Note;
import java.time.Instant;
import java.util.UUID;

public record NoteResponse(UUID id, String title, String contentMarkdown, Instant createdAt, Instant updatedAt) {

    public static NoteResponse from(Note note) {
        return new NoteResponse(
                note.getId(), note.getTitle(), note.getContentMarkdown(), note.getCreatedAt(), note.getUpdatedAt());
    }
}
