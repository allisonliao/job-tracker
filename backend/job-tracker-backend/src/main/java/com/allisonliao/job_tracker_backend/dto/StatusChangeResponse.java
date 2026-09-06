package com.allisonliao.job_tracker_backend.dto;

import java.time.Instant;

import com.allisonliao.job_tracker_backend.model.StatusChangeItem;

public record StatusChangeResponse(
        Instant changedAt,
        String fromStatus,
        String toStatus,
        String note
) {
    public static StatusChangeResponse from(StatusChangeItem item) {
        return new StatusChangeResponse(item.getChangedAt(), item.getFromStatus(), item.getToStatus(), item.getNote());
    }
}
