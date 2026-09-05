package com.allisonliao.job_tracker_backend.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.allisonliao.job_tracker_backend.integration.MiniStackTestBase;
import com.allisonliao.job_tracker_backend.model.ContactItem;

class ContactRepositoryTest extends MiniStackTestBase {

    @Autowired
    private ContactRepository contactRepository;

    private ContactItem newContact(String companyId, String contactId, String name) {
        ContactItem item = new ContactItem();
        item.setPk("COMPANY#" + companyId);
        item.setSk("CONTACT#" + contactId);
        item.setCompanyId(companyId);
        item.setContactId(contactId);
        item.setName(name);
        item.setRole("Recruiter");
        item.setEmail(name.toLowerCase().replace(" ", ".") + "@example.com");
        item.setPhone("555-0100");
        return item;
    }

    @Test
    void savesAndFindsContactById() {
        String companyId = UUID.randomUUID().toString();
        String contactId = UUID.randomUUID().toString();
        contactRepository.save(newContact(companyId, contactId, "Jane Recruiter"));

        Optional<ContactItem> found = contactRepository.findById(companyId, contactId);

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Jane Recruiter");
        assertThat(found.get().getRole()).isEqualTo("Recruiter");
    }

    @Test
    void findAllForCompanyReturnsOnlyThatCompanysContacts() {
        String companyId = UUID.randomUUID().toString();
        String otherCompanyId = UUID.randomUUID().toString();
        String contactId1 = UUID.randomUUID().toString();
        String contactId2 = UUID.randomUUID().toString();
        String otherContactId = UUID.randomUUID().toString();

        contactRepository.save(newContact(companyId, contactId1, "Jane Recruiter"));
        contactRepository.save(newContact(companyId, contactId2, "John Hiring Manager"));
        contactRepository.save(newContact(otherCompanyId, otherContactId, "Should Not Appear"));

        List<ContactItem> results = contactRepository.findAllForCompany(companyId);

        assertThat(results)
                .extracting(ContactItem::getContactId)
                .containsExactlyInAnyOrder(contactId1, contactId2);
    }

    @Test
    void deletesContactById() {
        String companyId = UUID.randomUUID().toString();
        String contactId = UUID.randomUUID().toString();
        contactRepository.save(newContact(companyId, contactId, "Temporary Contact"));
        assertThat(contactRepository.findById(companyId, contactId)).isPresent();

        contactRepository.deleteById(companyId, contactId);

        assertThat(contactRepository.findById(companyId, contactId)).isEmpty();
    }
}
