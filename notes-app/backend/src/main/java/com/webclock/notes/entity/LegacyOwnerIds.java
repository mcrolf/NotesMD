package com.webclock.notes.entity;

import java.util.UUID;

/**
 * Must match the Flyway seed user in {@code V2__users_and_legacy_owner.sql}.
 */
public final class LegacyOwnerIds {

    public static final UUID UNOWNED_NOTES_USER_ID = UUID.fromString("00000000-0000-4000-8000-000000000001");

    private LegacyOwnerIds() {}
}
