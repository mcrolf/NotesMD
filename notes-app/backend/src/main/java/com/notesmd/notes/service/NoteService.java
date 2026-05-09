package com.notesmd.notes.service;

import com.notesmd.notes.dto.NoteCreateRequest;
import com.notesmd.notes.dto.NoteResponse;
import com.notesmd.notes.dto.NoteUpdateRequest;
import com.notesmd.notes.entity.Note;
import com.notesmd.notes.exception.ResourceNotFoundException;
import com.notesmd.notes.repository.NoteRepository;
import com.notesmd.notes.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public NoteService(NoteRepository noteRepository, UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> listNewestFirst(UUID ownerId) {
        return noteRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId).stream()
                .map(NoteResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public NoteResponse get(UUID id, UUID ownerId) {
        return NoteResponse.from(noteOrThrow(id, ownerId));
    }

    @Transactional
    public NoteResponse create(NoteCreateRequest request, UUID ownerId) {
        Note note = new Note();
        if (request.title() != null) {
            note.setTitle(request.title());
        }
        if (request.contentMarkdown() != null) {
            note.setContentMarkdown(request.contentMarkdown());
        }
        note.setOwner(userRepository.getReferenceById(ownerId));
        return NoteResponse.from(noteRepository.save(note));
    }

    @Transactional
    public NoteResponse update(UUID id, NoteUpdateRequest request, UUID ownerId) {
        Note note = noteOrThrow(id, ownerId);
        if (request.title() != null) {
            note.setTitle(request.title());
        }
        if (request.contentMarkdown() != null) {
            note.setContentMarkdown(request.contentMarkdown());
        }
        return NoteResponse.from(noteRepository.save(note));
    }

    @Transactional
    public void delete(UUID id, UUID ownerId) {
        if (!noteRepository.findByIdAndOwnerId(id, ownerId).isPresent()) {
            throw new ResourceNotFoundException(id);
        }
        noteRepository.deleteByIdAndOwnerId(id, ownerId);
    }

    private Note noteOrThrow(UUID id, UUID ownerId) {
        return noteRepository
                .findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }
}
