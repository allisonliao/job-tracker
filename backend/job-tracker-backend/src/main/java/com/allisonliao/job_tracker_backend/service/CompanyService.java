package com.allisonliao.job_tracker_backend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.allisonliao.job_tracker_backend.model.CompanyItem;
import com.allisonliao.job_tracker_backend.repository.CompanyRepository;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public CompanyItem create(CompanyItem draft) {
        String companyId = UUID.randomUUID().toString();
        draft.setCompanyId(companyId);
        draft.setPk("COMPANY#" + companyId);
        draft.setSk("METADATA");
        return companyRepository.save(draft);
    }

    public Optional<CompanyItem> getById(String companyId) {
        return companyRepository.findById(companyId);
    }

    public List<CompanyItem> getAll() {
        return companyRepository.findAll();
    }

    public CompanyItem update(String companyId, CompanyItem updated) {
        updated.setCompanyId(companyId);
        updated.setPk("COMPANY#" + companyId);
        updated.setSk("METADATA");
        return companyRepository.save(updated);
    }

    public void delete(String companyId) {
        companyRepository.deleteById(companyId);
    }
}
