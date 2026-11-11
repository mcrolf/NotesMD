package com.notesmd.notes.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

@Schema(requiredProperties = {"userId", "username"})
public record AuthRegisterResponse(UUID userId, String username) {}
