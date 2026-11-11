package com.notesmd.notes.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.notesmd.notes.exception.ErrorResponse;
import com.notesmd.notes.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Authenticates {@code Authorization: Bearer} access tokens. The JWT subject is the user id; it becomes the
 * {@link UUID} principal that controllers read with {@code @AuthenticationPrincipal} and pass to services as the
 * note owner id. A token whose user no longer exists (for example after account deletion) is rejected.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final AntPathMatcher MATCHER = new AntPathMatcher();

    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public JwtAuthenticationFilter(
            JwtTokenService jwtTokenService, UserRepository userRepository, ObjectMapper objectMapper) {
        this.jwtTokenService = jwtTokenService;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = pathWithoutContext(request);
        return MATCHER.match("/api/auth/register", path)
                || MATCHER.match("/api/auth/login", path)
                || MATCHER.match("/actuator/**", path);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = header.substring(7).trim();
        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }
        Optional<UUID> userId = liveUserId(token);
        if (userId.isEmpty()) {
            rejectToken(response);
            return;
        }
        var auth = new UsernamePasswordAuthenticationToken(
                userId.get(), null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(auth);
        filterChain.doFilter(request, response);
    }

    private Optional<UUID> liveUserId(String token) {
        try {
            String subject = jwtTokenService.parseAndValidate(token).getSubject();
            if (subject == null) {
                return Optional.empty();
            }
            UUID userId = UUID.fromString(subject);
            return userRepository.existsById(userId) ? Optional.of(userId) : Optional.empty();
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    private void rejectToken(HttpServletResponse response) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        var body = ErrorResponse.of(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized", "Invalid or expired token");
        objectMapper.writeValue(response.getOutputStream(), body);
    }

    private static String pathWithoutContext(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String context = request.getContextPath();
        if (context != null && !context.isEmpty() && uri.startsWith(context)) {
            return uri.substring(context.length());
        }
        return uri;
    }
}
