package com.allisonliao.job_tracker_backend.dto;

import jakarta.validation.constraints.NotBlank;

public record StatusChangeRequest(
        @NotBlank String newStatus,
        String note
) {
}
