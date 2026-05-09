package com.notesmd.notes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthCredentialsRequest(
        @NotBlank @Size(min = 3, max = 255) String username,
        @NotBlank @Size(min = 8, max = 128) String password) {}
