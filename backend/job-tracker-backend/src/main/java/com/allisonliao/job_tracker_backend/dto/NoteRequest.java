package com.allisonliao.job_tracker_backend.dto;

import jakarta.validation.constraints.NotBlank;

public record NoteRequest(
        @NotBlank String text
) {
}
