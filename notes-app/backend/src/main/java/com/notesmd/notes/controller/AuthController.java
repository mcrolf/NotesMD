package com.notesmd.notes.controller;

import com.notesmd.notes.dto.AuthCredentialsRequest;
import com.notesmd.notes.dto.AuthRegisterResponse;
import com.notesmd.notes.dto.DeleteAccountRequest;
import com.notesmd.notes.dto.LoginResponse;
import com.notesmd.notes.service.AuthService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthRegisterResponse register(@Valid @RequestBody AuthCredentialsRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody AuthCredentialsRequest request) {
        return authService.login(request);
    }

    @DeleteMapping("/account")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(
            Authentication authentication, @Valid @RequestBody DeleteAccountRequest request) {
        authService.deleteAccount(UUID.fromString(authentication.getName()), request);
    }
}
