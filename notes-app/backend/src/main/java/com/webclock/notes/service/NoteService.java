package com.webclock.notes.service;

import com.webclock.notes.dto.NoteCreateRequest;
import com.webclock.notes.dto.NoteResponse;
import com.webclock.notes.dto.NoteUpdateRequest;
import com.webclock.notes.entity.LegacyOwnerIds;
import com.webclock.notes.entity.Note;
import com.webclock.notes.exception.ResourceNotFoundException;
import com.webclock.notes.repository.NoteRepository;
import com.webclock.notes.repository.UserRepository;
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
    public List<NoteResponse> listNewestFirst() {
        return noteRepository.findAllByOrderByCreatedAtDesc().stream().map(NoteResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public NoteResponse get(UUID id) {
        return NoteResponse.from(noteOrThrow(id));
    }

    @Transactional
    public NoteResponse create(NoteCreateRequest request) {
        Note note = new Note();
        if (request.title() != null) {
            note.setTitle(request.title());
        }
        if (request.contentMarkdown() != null) {
            note.setContentMarkdown(request.contentMarkdown());
        }
        note.setOwner(userRepository.getReferenceById(LegacyOwnerIds.UNOWNED_NOTES_USER_ID));
        return NoteResponse.from(noteRepository.save(note));
    }

    @Transactional
    public NoteResponse update(UUID id, NoteUpdateRequest request) {
        Note note = noteOrThrow(id);
        if (request.title() != null) {
            note.setTitle(request.title());
        }
        if (request.contentMarkdown() != null) {
            note.setContentMarkdown(request.contentMarkdown());
        }
        return NoteResponse.from(noteRepository.save(note));
    }

    @Transactional
    public void delete(UUID id) {
        if (!noteRepository.existsById(id)) {
            throw new ResourceNotFoundException(id);
        }
        noteRepository.deleteById(id);
    }

    private Note noteOrThrow(UUID id) {
        return noteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(id));
    }
}
