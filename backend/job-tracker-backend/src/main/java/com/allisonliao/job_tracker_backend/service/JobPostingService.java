package com.allisonliao.job_tracker_backend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.allisonliao.job_tracker_backend.model.JobPostingItem;
import com.allisonliao.job_tracker_backend.repository.JobPostingRepository;

@Service
public class JobPostingService {

    private final JobPostingRepository jobPostingRepository;

    public JobPostingService(JobPostingRepository jobPostingRepository) {
        this.jobPostingRepository = jobPostingRepository;
    }

    public JobPostingItem create(String companyId, JobPostingItem draft) {
        String jobId = UUID.randomUUID().toString();
        draft.setCompanyId(companyId);
        draft.setJobId(jobId);
        draft.setPk("COMPANY#" + companyId);
        draft.setSk("JOB#" + jobId);
        return jobPostingRepository.save(draft);
    }

    public Optional<JobPostingItem> getById(String companyId, String jobId) {
        return jobPostingRepository.findById(companyId, jobId);
    }

    public List<JobPostingItem> getAllForCompany(String companyId) {
        return jobPostingRepository.findAllForCompany(companyId);
    }

    public JobPostingItem update(String companyId, String jobId, JobPostingItem updated) {
        updated.setCompanyId(companyId);
        updated.setJobId(jobId);
        updated.setPk("COMPANY#" + companyId);
        updated.setSk("JOB#" + jobId);
        return jobPostingRepository.save(updated);
    }

    public void delete(String companyId, String jobId) {
        jobPostingRepository.deleteById(companyId, jobId);
    }
}
