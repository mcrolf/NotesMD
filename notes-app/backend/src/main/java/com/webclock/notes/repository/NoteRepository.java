package com.webclock.notes.repository;

import com.webclock.notes.entity.Note;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, UUID> {

    List<Note> findAllByOrderByCreatedAtDesc();
}
