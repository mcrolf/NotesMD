package com.webclock.notes.controller;

import com.webclock.notes.dto.AuthCredentialsRequest;
import com.webclock.notes.dto.AuthRegisterResponse;
import com.webclock.notes.dto.LoginResponse;
import com.webclock.notes.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
}
