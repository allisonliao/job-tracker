package com.allisonliao.job_tracker_backend.dto;

import java.time.Instant;

import com.allisonliao.job_tracker_backend.model.InterviewItem;

public record InterviewResponse(
        Instant interviewDate,
        String roundType,
        String notes
) {
    public static InterviewResponse from(InterviewItem item) {
        return new InterviewResponse(item.getInterviewDate(), item.getRoundType(), item.getNotes());
    }
}
