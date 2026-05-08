package com.webclock.notes.dto;

import java.util.UUID;

public record AuthRegisterResponse(UUID userId, String username) {}
