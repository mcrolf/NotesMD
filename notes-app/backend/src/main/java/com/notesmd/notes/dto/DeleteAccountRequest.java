package com.notesmd.notes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Request body for {@code DELETE /api/auth/account}. */
public record DeleteAccountRequest(
        @NotBlank(message = "confirmation is required")
        @Pattern(regexp = REQUIRED_PHRASE, message = "Type \"delete my account\" to confirm")
        String confirmation) {

    public static final String REQUIRED_PHRASE = "delete my account";
}
