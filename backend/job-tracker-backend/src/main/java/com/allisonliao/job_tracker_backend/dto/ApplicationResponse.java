package com.allisonliao.job_tracker_backend.dto;

import java.time.LocalDate;

import com.allisonliao.job_tracker_backend.model.ApplicationItem;

public record ApplicationResponse(
        String applicationId,
        String companyId,
        String jobPostingId,
        String currentStatus,
        LocalDate dateApplied,
        LocalDate lastContactDate,
        LocalDate followUpDate,
        LocalDate offerDecisionDeadline
) {
    public static ApplicationResponse from(ApplicationItem item) {
        return new ApplicationResponse(
                item.getApplicationId(),
                item.getCompanyId(),
                item.getJobPostingId(),
                item.getCurrentStatus(),
                item.getDateApplied(),
                item.getLastContactDate(),
                item.getFollowUpDate(),
                item.getOfferDecisionDeadline());
    }
}
