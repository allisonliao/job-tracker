package com.allisonliao.job_tracker_backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

public record ApplicationRequest(
        @NotBlank String companyId,
        String jobPostingId,
        @NotBlank String currentStatus,
        LocalDate dateApplied,
        LocalDate lastContactDate,
        LocalDate followUpDate,
        LocalDate offerDecisionDeadline
) {
}
