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

import com.allisonliao.job_tracker_backend.dto.CompanyRequest;
import com.allisonliao.job_tracker_backend.dto.CompanyResponse;
import com.allisonliao.job_tracker_backend.model.CompanyItem;
import com.allisonliao.job_tracker_backend.service.CompanyService;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public List<CompanyResponse> getAll() {
        return companyService.getAll().stream().map(CompanyResponse::from).toList();
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable String companyId) {
        return companyService.getById(companyId)
                .map(CompanyResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyResponse create(@Valid @RequestBody CompanyRequest request) {
        CompanyItem item = toItem(request);
        return CompanyResponse.from(companyService.create(item));
    }

    @PutMapping("/{companyId}")
    public CompanyResponse update(@PathVariable String companyId, @Valid @RequestBody CompanyRequest request) {
        CompanyItem item = toItem(request);
        return CompanyResponse.from(companyService.update(companyId, item));
    }

    @DeleteMapping("/{companyId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String companyId) {
        companyService.delete(companyId);
    }

    private CompanyItem toItem(CompanyRequest request) {
        CompanyItem item = new CompanyItem();
        item.setName(request.name());
        item.setWebsite(request.website());
        item.setIndustry(request.industry());
        item.setNotes(request.notes());
        return item;
    }
}
