package com.webclock.notes.repository;

import com.webclock.notes.entity.Note;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, UUID> {

    List<Note> findAllByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

    Optional<Note> findByIdAndOwnerId(UUID id, UUID ownerId);

    void deleteByIdAndOwnerId(UUID id, UUID ownerId);
}
