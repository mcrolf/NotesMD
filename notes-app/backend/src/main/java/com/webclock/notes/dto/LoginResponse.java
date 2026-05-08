package com.webclock.notes.dto;

public record LoginResponse(String accessToken, String tokenType, long expiresIn, String username) {}
