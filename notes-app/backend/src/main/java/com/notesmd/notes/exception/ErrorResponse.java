package com.notesmd.notes.exception;

import java.util.Map;

/** JSON body for API errors from {@link GlobalExceptionHandler}. */
public record ErrorResponse(int status, String error, String message, Map<String, String> fieldErrors) {

    public static ErrorResponse of(int status, String error, String message) {
        return new ErrorResponse(status, error, message, null);
    }

    public static ErrorResponse validation(int status, String error, Map<String, String> fieldErrors) {
        return new ErrorResponse(status, error, "Validation failed", fieldErrors);
    }
}
