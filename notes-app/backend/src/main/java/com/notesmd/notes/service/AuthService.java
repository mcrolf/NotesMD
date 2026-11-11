package com.notesmd.notes.service;

import com.notesmd.notes.config.AuthProperties;
import com.notesmd.notes.dto.AuthCredentialsRequest;
import com.notesmd.notes.dto.AuthRegisterResponse;
import com.notesmd.notes.dto.DeleteAccountRequest;
import com.notesmd.notes.dto.LoginResponse;
import com.notesmd.notes.entity.LegacyOwnerIds;
import com.notesmd.notes.entity.User;
import com.notesmd.notes.exception.DuplicateUsernameException;
import com.notesmd.notes.exception.InvalidCredentialsException;
import com.notesmd.notes.exception.RegistrationDisabledException;
import com.notesmd.notes.repository.NoteRepository;
import com.notesmd.notes.repository.UserRepository;
import com.notesmd.notes.security.JwtTokenService;
import com.notesmd.notes.security.LoginThrottle;
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
    private final LoginThrottle loginThrottle;
    private final AuthProperties authProperties;

    public AuthService(
            UserRepository userRepository,
            NoteRepository noteRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService,
            LoginThrottle loginThrottle,
            AuthProperties authProperties) {
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.loginThrottle = loginThrottle;
        this.authProperties = authProperties;
    }

    @Transactional
    public AuthRegisterResponse register(AuthCredentialsRequest request) {
        if (!authProperties.isRegistrationEnabled()) {
            throw new RegistrationDisabledException();
        }
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
    public LoginResponse login(AuthCredentialsRequest request, String clientAddress) {
        String username = request.username().trim();
        loginThrottle.checkAllowed(clientAddress, username);
        User user = userRepository
                .findByUsername(username)
                .filter(candidate -> canSignIn(candidate, request.password()))
                .orElseThrow(() -> {
                    loginThrottle.recordFailure(clientAddress, username);
                    return new InvalidCredentialsException();
                });
        loginThrottle.recordSuccess(clientAddress, username);
        String accessToken = jwtTokenService.createAccessToken(user);
        return new LoginResponse(
                accessToken,
                "Bearer",
                jwtTokenService.accessTokenTtlSeconds(),
                user.getUsername());
    }

    /** The confirmation phrase is enforced by {@link DeleteAccountRequest} validation at the controller. */
    @Transactional
    public void deleteAccount(UUID userId) {
        noteRepository.deleteAllByOwnerId(userId);
        userRepository.deleteById(userId);
        log.info("Deleted account {}", userId);
    }

    private boolean canSignIn(User user, String password) {
        return !LegacyOwnerIds.UNOWNED_NOTES_USER_ID.equals(user.getId())
                && passwordEncoder.matches(password, user.getPasswordHash());
    }
}
