package com.notesmd.notes.exception;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse notFound(ResourceNotFoundException ex) {
        return ErrorResponse.of(HttpStatus.NOT_FOUND.value(), "Not Found", ex.getMessage());
    }

    @ExceptionHandler({NoteArchivedException.class, NoteNotArchivedException.class})
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse wrongArchiveState(RuntimeException ex) {
        return ErrorResponse.of(HttpStatus.CONFLICT.value(), "Conflict", ex.getMessage());
    }

    @ExceptionHandler(RegistrationDisabledException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse registrationDisabled(RegistrationDisabledException ex) {
        return ErrorResponse.of(HttpStatus.FORBIDDEN.value(), "Forbidden", ex.getMessage());
    }

    @ExceptionHandler(TooManyLoginAttemptsException.class)
    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    public ResponseEntity<ErrorResponse> tooManyLoginAttempts(TooManyLoginAttemptsException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, Long.toString(ex.getRetryAfter().toSeconds()))
                .body(ErrorResponse.of(HttpStatus.TOO_MANY_REQUESTS.value(), "Too Many Requests", ex.getMessage()));
    }

    @ExceptionHandler(DuplicateUsernameException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse duplicateUsername(DuplicateUsernameException ex) {
        return ErrorResponse.of(HttpStatus.CONFLICT.value(), "Conflict", ex.getMessage());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse invalidCredentials(InvalidCredentialsException ex) {
        return ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "Unauthorized", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse validation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "invalid");
        }
        return ErrorResponse.validation(HttpStatus.BAD_REQUEST.value(), "Bad Request", fieldErrors);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse badRequest(Exception ex) {
        String detail = ex instanceof MethodArgumentTypeMismatchException mat
                ? "Invalid path parameter: " + mat.getName()
                : "Malformed request body";
        return ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "Bad Request", detail);
    }
}
