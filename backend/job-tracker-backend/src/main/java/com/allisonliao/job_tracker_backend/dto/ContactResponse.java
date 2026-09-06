package com.allisonliao.job_tracker_backend.dto;

import com.allisonliao.job_tracker_backend.model.ContactItem;

public record ContactResponse(
        String contactId,
        String companyId,
        String name,
        String role,
        String email,
        String phone
) {
    public static ContactResponse from(ContactItem item) {
        return new ContactResponse(
                item.getContactId(),
                item.getCompanyId(),
                item.getName(),
                item.getRole(),
                item.getEmail(),
                item.getPhone());
    }
}
