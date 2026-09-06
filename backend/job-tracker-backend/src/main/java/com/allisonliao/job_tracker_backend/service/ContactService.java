package com.allisonliao.job_tracker_backend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.allisonliao.job_tracker_backend.model.ContactItem;
import com.allisonliao.job_tracker_backend.repository.ContactRepository;

@Service
public class ContactService {

    private final ContactRepository contactRepository;

    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    public ContactItem create(String companyId, ContactItem draft) {
        String contactId = UUID.randomUUID().toString();
        draft.setCompanyId(companyId);
        draft.setContactId(contactId);
        draft.setPk("COMPANY#" + companyId);
        draft.setSk("CONTACT#" + contactId);
        return contactRepository.save(draft);
    }

    public Optional<ContactItem> getById(String companyId, String contactId) {
        return contactRepository.findById(companyId, contactId);
    }

    public List<ContactItem> getAllForCompany(String companyId) {
        return contactRepository.findAllForCompany(companyId);
    }

    public ContactItem update(String companyId, String contactId, ContactItem updated) {
        updated.setCompanyId(companyId);
        updated.setContactId(contactId);
        updated.setPk("COMPANY#" + companyId);
        updated.setSk("CONTACT#" + contactId);
        return contactRepository.save(updated);
    }

    public void delete(String companyId, String contactId) {
        contactRepository.deleteById(companyId, contactId);
    }
}
