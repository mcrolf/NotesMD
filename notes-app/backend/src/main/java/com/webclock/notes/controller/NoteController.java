package com.webclock.notes.controller;

import com.webclock.notes.dto.NoteCreateRequest;
import com.webclock.notes.dto.NoteResponse;
import com.webclock.notes.dto.NoteUpdateRequest;
import com.webclock.notes.service.NoteService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public List<NoteResponse> list(Authentication authentication) {
        return noteService.listNewestFirst(currentUserId(authentication));
    }

    @GetMapping("/{id}")
    public NoteResponse get(Authentication authentication, @PathVariable UUID id) {
        return noteService.get(id, currentUserId(authentication));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoteResponse create(Authentication authentication, @Valid @RequestBody NoteCreateRequest request) {
        return noteService.create(request, currentUserId(authentication));
    }

    @PatchMapping("/{id}")
    public NoteResponse patch(
            Authentication authentication, @PathVariable UUID id, @Valid @RequestBody NoteUpdateRequest request) {
        return noteService.update(id, request, currentUserId(authentication));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication authentication, @PathVariable UUID id) {
        noteService.delete(id, currentUserId(authentication));
    }

    private static UUID currentUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
