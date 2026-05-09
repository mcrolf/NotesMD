package com.notesmd.notes.dto;

import java.util.UUID;

public record AuthRegisterResponse(UUID userId, String username) {}
