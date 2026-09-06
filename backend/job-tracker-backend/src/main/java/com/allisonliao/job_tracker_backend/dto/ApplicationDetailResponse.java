package com.allisonliao.job_tracker_backend.dto;

import java.time.LocalDate;
import java.util.List;

import com.allisonliao.job_tracker_backend.model.ApplicationItem;
import com.allisonliao.job_tracker_backend.model.InterviewItem;
import com.allisonliao.job_tracker_backend.model.NoteItem;
import com.allisonliao.job_tracker_backend.model.StatusChangeItem;

public record ApplicationDetailResponse(
        String applicationId,
        String companyId,
        String jobPostingId,
        String currentStatus,
        LocalDate dateApplied,
        LocalDate lastContactDate,
        LocalDate followUpDate,
        LocalDate offerDecisionDeadline,
        List<InterviewResponse> interviews,
        List<StatusChangeResponse> statusHistory,
        List<NoteResponse> notes
) {
    public static ApplicationDetailResponse from(ApplicationItem application,
                                                  List<InterviewItem> interviews,
                                                  List<StatusChangeItem> statusHistory,
                                                  List<NoteItem> notes) {
        return new ApplicationDetailResponse(
                application.getApplicationId(),
                application.getCompanyId(),
                application.getJobPostingId(),
                application.getCurrentStatus(),
                application.getDateApplied(),
                application.getLastContactDate(),
                application.getFollowUpDate(),
                application.getOfferDecisionDeadline(),
                interviews.stream().map(InterviewResponse::from).toList(),
                statusHistory.stream().map(StatusChangeResponse::from).toList(),
                notes.stream().map(NoteResponse::from).toList());
    }
}
