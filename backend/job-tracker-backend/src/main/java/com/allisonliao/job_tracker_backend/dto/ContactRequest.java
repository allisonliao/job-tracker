package com.allisonliao.job_tracker_backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ContactRequest(
        @NotBlank String name,
        String role,
        String email,
        String phone
) {
}
