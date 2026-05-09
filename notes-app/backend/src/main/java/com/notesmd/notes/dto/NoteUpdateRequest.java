package com.notesmd.notes.dto;

import jakarta.validation.constraints.Size;

/** Request body for {@code PATCH /api/notes/{id}}; null fields are left unchanged. */
public record NoteUpdateRequest(
        @Size(max = 500, message = "title must be at most 500 characters") String title,

        @Size(max = 1_000_000, message = "content must be at most 1000000 characters")
                String contentMarkdown) {}
