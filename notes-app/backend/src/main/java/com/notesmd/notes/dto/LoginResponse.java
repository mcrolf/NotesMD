package com.notesmd.notes.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(requiredProperties = {"accessToken", "tokenType", "expiresIn", "username"})
public record LoginResponse(String accessToken, String tokenType, long expiresIn, String username) {}
