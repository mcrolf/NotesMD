package com.notesmd.notes.controller;

import com.notesmd.notes.dto.NoteCreateRequest;
import com.notesmd.notes.dto.NoteResponse;
import com.notesmd.notes.dto.NoteUpdateRequest;
import com.notesmd.notes.service.NoteService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    // Restrict {id} to UUIDs so literal paths like /archived are not parsed as note ids.
    private static final String NOTE_ID =
            "{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}";

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public List<NoteResponse> list(@AuthenticationPrincipal UUID userId) {
        return noteService.listNewestFirst(userId);
    }

    @GetMapping("/archived")
    public List<NoteResponse> listArchived(@AuthenticationPrincipal UUID userId) {
        return noteService.listArchived(userId);
    }

    @GetMapping("/" + NOTE_ID)
    public NoteResponse get(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        return noteService.get(id, userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoteResponse create(@AuthenticationPrincipal UUID userId, @Valid @RequestBody NoteCreateRequest request) {
        return noteService.create(request, userId);
    }

    @PatchMapping("/" + NOTE_ID)
    public NoteResponse patch(
            @AuthenticationPrincipal UUID userId, @PathVariable UUID id, @Valid @RequestBody NoteUpdateRequest request) {
        return noteService.update(id, request, userId);
    }

    @PostMapping("/" + NOTE_ID + "/archive")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        noteService.archive(id, userId);
    }

    @PostMapping("/" + NOTE_ID + "/restore")
    public NoteResponse restore(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        return noteService.restore(id, userId);
    }

    @DeleteMapping("/" + NOTE_ID)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        noteService.delete(id, userId);
    }
}
