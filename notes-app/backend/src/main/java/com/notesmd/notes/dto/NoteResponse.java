package com.notesmd.notes.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.notesmd.notes.entity.Note;
import java.time.Instant;
import java.util.UUID;

@Schema(requiredProperties = {"id", "title", "contentMarkdown", "createdAt", "updatedAt", "archivedAt"})
public record NoteResponse(
        UUID id,
        String title,
        String contentMarkdown,
        Instant createdAt,
        Instant updatedAt,
        @Schema(nullable = true, description = "Set while the note is archived") Instant archivedAt) {

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
