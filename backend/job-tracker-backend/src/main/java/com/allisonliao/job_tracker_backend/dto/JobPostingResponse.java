package com.allisonliao.job_tracker_backend.dto;

import java.time.LocalDate;

import com.allisonliao.job_tracker_backend.model.JobPostingItem;

public record JobPostingResponse(
        String jobId,
        String companyId,
        String title,
        String url,
        String location,
        LocalDate dateFound,
        LocalDate applicationDeadline
) {
    public static JobPostingResponse from(JobPostingItem item) {
        return new JobPostingResponse(
                item.getJobId(),
                item.getCompanyId(),
                item.getTitle(),
                item.getUrl(),
                item.getLocation(),
                item.getDateFound(),
                item.getApplicationDeadline());
    }
}
