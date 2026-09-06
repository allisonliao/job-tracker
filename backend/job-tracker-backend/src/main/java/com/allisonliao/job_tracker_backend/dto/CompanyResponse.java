package com.allisonliao.job_tracker_backend.dto;

import com.allisonliao.job_tracker_backend.model.CompanyItem;

public record CompanyResponse(
        String companyId,
        String name,
        String website,
        String industry,
        String notes
) {
    public static CompanyResponse from(CompanyItem item) {
        return new CompanyResponse(
                item.getCompanyId(),
                item.getName(),
                item.getWebsite(),
                item.getIndustry(),
                item.getNotes());
    }
}
