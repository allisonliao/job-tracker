package com.allisonliao.job_tracker_backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CompanyRequest(
        @NotBlank String name,
        String website,
        String industry,
        String notes
) {
}
