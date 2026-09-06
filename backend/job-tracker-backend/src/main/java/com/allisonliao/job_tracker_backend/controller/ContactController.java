package com.allisonliao.job_tracker_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.allisonliao.job_tracker_backend.dto.ContactRequest;
import com.allisonliao.job_tracker_backend.dto.ContactResponse;
import com.allisonliao.job_tracker_backend.model.ContactItem;
import com.allisonliao.job_tracker_backend.service.ContactService;

@RestController
@RequestMapping("/api/companies/{companyId}/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    public List<ContactResponse> getAllForCompany(@PathVariable String companyId) {
        return contactService.getAllForCompany(companyId).stream().map(ContactResponse::from).toList();
    }

    @GetMapping("/{contactId}")
    public ResponseEntity<ContactResponse> getById(@PathVariable String companyId, @PathVariable String contactId) {
        return contactService.getById(companyId, contactId)
                .map(ContactResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactResponse create(@PathVariable String companyId, @Valid @RequestBody ContactRequest request) {
        return ContactResponse.from(contactService.create(companyId, toItem(request)));
    }

    @PutMapping("/{contactId}")
    public ContactResponse update(@PathVariable String companyId, @PathVariable String contactId,
                                   @Valid @RequestBody ContactRequest request) {
        return ContactResponse.from(contactService.update(companyId, contactId, toItem(request)));
    }

    @DeleteMapping("/{contactId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String companyId, @PathVariable String contactId) {
        contactService.delete(companyId, contactId);
    }

    private ContactItem toItem(ContactRequest request) {
        ContactItem item = new ContactItem();
        item.setName(request.name());
        item.setRole(request.role());
        item.setEmail(request.email());
        item.setPhone(request.phone());
        return item;
    }
}
