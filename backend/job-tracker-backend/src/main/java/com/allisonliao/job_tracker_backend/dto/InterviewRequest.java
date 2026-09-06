package com.allisonliao.job_tracker_backend.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotNull;

public record InterviewRequest(
        @NotNull Instant interviewDate,
        String roundType,
        String notes
) {
}
