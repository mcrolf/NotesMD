package com.notesmd.notes.exception;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Map;

/** JSON body for API errors from {@link GlobalExceptionHandler}. */
@Schema(requiredProperties = {"status", "error", "message", "fieldErrors"})
public record ErrorResponse(
        int status,
        String error,
        String message,
        @Schema(nullable = true, description = "Per-field messages for validation errors") Map<String, String> fieldErrors) {

    public static ErrorResponse of(int status, String error, String message) {
        return new ErrorResponse(status, error, message, null);
    }

    public static ErrorResponse validation(int status, String error, Map<String, String> fieldErrors) {
        return new ErrorResponse(status, error, "Validation failed", fieldErrors);
    }
}
