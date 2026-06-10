package com.notesmd.notes.repository;

import com.notesmd.notes.entity.Note;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, UUID> {

    List<Note> findAllByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

    // Active notes only (archived_at IS NULL), newest first
    List<Note> findAllByOwnerIdAndArchivedAtIsNullOrderByCreatedAtDesc(UUID ownerId);

    // Archived notes only, most recently archived first
    List<Note> findAllByOwnerIdAndArchivedAtIsNotNullOrderByArchivedAtDesc(UUID ownerId);

    Optional<Note> findByIdAndOwnerId(UUID id, UUID ownerId);

    void deleteByIdAndOwnerId(UUID id, UUID ownerId);
}
