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

import com.allisonliao.job_tracker_backend.dto.JobPostingRequest;
import com.allisonliao.job_tracker_backend.dto.JobPostingResponse;
import com.allisonliao.job_tracker_backend.model.JobPostingItem;
import com.allisonliao.job_tracker_backend.service.JobPostingService;

@RestController
@RequestMapping("/api/companies/{companyId}/job-postings")
public class JobPostingController {

    private final JobPostingService jobPostingService;

    public JobPostingController(JobPostingService jobPostingService) {
        this.jobPostingService = jobPostingService;
    }

    @GetMapping
    public List<JobPostingResponse> getAllForCompany(@PathVariable String companyId) {
        return jobPostingService.getAllForCompany(companyId).stream().map(JobPostingResponse::from).toList();
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<JobPostingResponse> getById(@PathVariable String companyId, @PathVariable String jobId) {
        return jobPostingService.getById(companyId, jobId)
                .map(JobPostingResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobPostingResponse create(@PathVariable String companyId, @Valid @RequestBody JobPostingRequest request) {
        return JobPostingResponse.from(jobPostingService.create(companyId, toItem(request)));
    }

    @PutMapping("/{jobId}")
    public JobPostingResponse update(@PathVariable String companyId, @PathVariable String jobId,
                                      @Valid @RequestBody JobPostingRequest request) {
        return JobPostingResponse.from(jobPostingService.update(companyId, jobId, toItem(request)));
    }

    @DeleteMapping("/{jobId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String companyId, @PathVariable String jobId) {
        jobPostingService.delete(companyId, jobId);
    }

    private JobPostingItem toItem(JobPostingRequest request) {
        JobPostingItem item = new JobPostingItem();
        item.setTitle(request.title());
        item.setUrl(request.url());
        item.setLocation(request.location());
        item.setDateFound(request.dateFound());
        item.setApplicationDeadline(request.applicationDeadline());
        return item;
    }
}
