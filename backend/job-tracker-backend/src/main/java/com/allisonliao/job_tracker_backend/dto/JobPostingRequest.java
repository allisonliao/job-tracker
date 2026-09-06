package com.allisonliao.job_tracker_backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

public record JobPostingRequest(
        @NotBlank String title,
        String url,
        String location,
        LocalDate dateFound,
        LocalDate applicationDeadline
) {
}
