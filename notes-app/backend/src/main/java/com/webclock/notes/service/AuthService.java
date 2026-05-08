package com.webclock.notes.service;

import com.webclock.notes.dto.AuthCredentialsRequest;
import com.webclock.notes.dto.AuthRegisterResponse;
import com.webclock.notes.dto.LoginResponse;
import com.webclock.notes.entity.User;
import com.webclock.notes.exception.DuplicateUsernameException;
import com.webclock.notes.exception.InvalidCredentialsException;
import com.webclock.notes.repository.UserRepository;
import com.webclock.notes.security.JwtTokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthService(
            UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenService jwtTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    @Transactional
    public AuthRegisterResponse register(AuthCredentialsRequest request) {
        String username = request.username().trim();
        if (userRepository.findByUsername(username).isPresent()) {
            throw new DuplicateUsernameException();
        }
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        return new AuthRegisterResponse(user.getId(), user.getUsername());
    }

    @Transactional(readOnly = true)
    public LoginResponse login(AuthCredentialsRequest request) {
        String username = request.username().trim();
        User user = userRepository.findByUsername(username).orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        String accessToken = jwtTokenService.createAccessToken(user);
        return new LoginResponse(
                accessToken,
                "Bearer",
                jwtTokenService.accessTokenTtlSeconds(),
                user.getUsername());
    }
}
