package com.allisonliao.job_tracker_backend.dto;

import java.time.Instant;

import com.allisonliao.job_tracker_backend.model.NoteItem;

public record NoteResponse(
        Instant createdAt,
        String text
) {
    public static NoteResponse from(NoteItem item) {
        return new NoteResponse(item.getCreatedAt(), item.getText());
    }
}
