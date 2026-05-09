package com.notesmd.notes.dto;

public record LoginResponse(String accessToken, String tokenType, long expiresIn, String username) {}
