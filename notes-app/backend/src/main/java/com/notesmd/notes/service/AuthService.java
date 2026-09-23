package com.notesmd.notes.service;

import com.notesmd.notes.dto.AuthCredentialsRequest;
import com.notesmd.notes.dto.AuthRegisterResponse;
import com.notesmd.notes.dto.DeleteAccountRequest;
import com.notesmd.notes.dto.LoginResponse;
import com.notesmd.notes.entity.User;
import com.notesmd.notes.exception.DuplicateUsernameException;
import com.notesmd.notes.exception.InvalidCredentialsException;
import com.notesmd.notes.repository.NoteRepository;
import com.notesmd.notes.repository.UserRepository;
import com.notesmd.notes.security.JwtTokenService;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthService(
            UserRepository userRepository,
            NoteRepository noteRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService) {
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
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

    @Transactional
    public void deleteAccount(UUID userId, DeleteAccountRequest request) {
        if (!DeleteAccountRequest.REQUIRED_PHRASE.equals(request.confirmation())) {
            throw new IllegalArgumentException("Type \"delete my account\" to confirm");
        }
        noteRepository.deleteAllByOwnerId(userId);
        userRepository.deleteById(userId);
        log.info("Deleted account {}", userId);
    }
}
