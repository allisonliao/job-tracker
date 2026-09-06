package com.allisonliao.job_tracker_backend.controller;

import java.time.LocalDate;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.allisonliao.job_tracker_backend.dto.ApplicationDetailResponse;
import com.allisonliao.job_tracker_backend.dto.ApplicationRequest;
import com.allisonliao.job_tracker_backend.dto.ApplicationResponse;
import com.allisonliao.job_tracker_backend.dto.InterviewRequest;
import com.allisonliao.job_tracker_backend.dto.InterviewResponse;
import com.allisonliao.job_tracker_backend.dto.NoteRequest;
import com.allisonliao.job_tracker_backend.dto.NoteResponse;
import com.allisonliao.job_tracker_backend.dto.StatusChangeRequest;
import com.allisonliao.job_tracker_backend.dto.StatusChangeResponse;
import com.allisonliao.job_tracker_backend.model.ApplicationItem;
import com.allisonliao.job_tracker_backend.model.InterviewItem;
import com.allisonliao.job_tracker_backend.model.NoteItem;
import com.allisonliao.job_tracker_backend.service.ApplicationService;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public List<ApplicationResponse> getAll(@RequestParam(required = false) String status,
                                             @RequestParam(required = false) String companyId) {
        List<ApplicationItem> items;
        if (companyId != null) {
            items = applicationService.listForCompany(companyId);
        } else if (status != null) {
            items = applicationService.listByStatus(status);
        } else {
            items = applicationService.listAll();
        }
        return items.stream().map(ApplicationResponse::from).toList();
    }

    @GetMapping("/upcoming")
    public List<ApplicationResponse> getUpcoming(
            @RequestParam(required = false) LocalDate dueBy) {
        LocalDate cutoff = dueBy != null ? dueBy : LocalDate.now();
        return applicationService.listFollowUpsDueBy(cutoff).stream().map(ApplicationResponse::from).toList();
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationDetailResponse> getById(@PathVariable String applicationId) {
        return applicationService.getById(applicationId)
                .map(application -> ApplicationDetailResponse.from(
                        application,
                        applicationService.getInterviews(applicationId),
                        applicationService.getStatusHistory(applicationId),
                        applicationService.getNotes(applicationId)))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse create(@Valid @RequestBody ApplicationRequest request) {
        return ApplicationResponse.from(applicationService.create(toItem(request)));
    }

    @PutMapping("/{applicationId}")
    public ApplicationResponse update(@PathVariable String applicationId,
                                       @Valid @RequestBody ApplicationRequest request) {
        return ApplicationResponse.from(applicationService.update(applicationId, toItem(request)));
    }

    @DeleteMapping("/{applicationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String applicationId) {
        applicationService.delete(applicationId);
    }

    @PostMapping("/{applicationId}/status")
    public ApplicationResponse changeStatus(@PathVariable String applicationId,
                                             @Valid @RequestBody StatusChangeRequest request) {
        return ApplicationResponse.from(
                applicationService.changeStatus(applicationId, request.newStatus(), request.note()));
    }

    @GetMapping("/{applicationId}/interviews")
    public List<InterviewResponse> getInterviews(@PathVariable String applicationId) {
        return applicationService.getInterviews(applicationId).stream().map(InterviewResponse::from).toList();
    }

    @PostMapping("/{applicationId}/interviews")
    @ResponseStatus(HttpStatus.CREATED)
    public InterviewResponse addInterview(@PathVariable String applicationId,
                                           @Valid @RequestBody InterviewRequest request) {
        InterviewItem draft = new InterviewItem();
        draft.setInterviewDate(request.interviewDate());
        draft.setRoundType(request.roundType());
        draft.setNotes(request.notes());
        return InterviewResponse.from(applicationService.addInterview(applicationId, draft));
    }

    @GetMapping("/{applicationId}/notes")
    public List<NoteResponse> getNotes(@PathVariable String applicationId) {
        return applicationService.getNotes(applicationId).stream().map(NoteResponse::from).toList();
    }

    @PostMapping("/{applicationId}/notes")
    @ResponseStatus(HttpStatus.CREATED)
    public NoteResponse addNote(@PathVariable String applicationId, @Valid @RequestBody NoteRequest request) {
        NoteItem draft = new NoteItem();
        draft.setText(request.text());
        return NoteResponse.from(applicationService.addNote(applicationId, draft));
    }

    @GetMapping("/{applicationId}/status-history")
    public List<StatusChangeResponse> getStatusHistory(@PathVariable String applicationId) {
        return applicationService.getStatusHistory(applicationId).stream().map(StatusChangeResponse::from).toList();
    }

    private ApplicationItem toItem(ApplicationRequest request) {
        ApplicationItem item = new ApplicationItem();
        item.setCompanyId(request.companyId());
        item.setJobPostingId(request.jobPostingId());
        item.setCurrentStatus(request.currentStatus());
        item.setDateApplied(request.dateApplied());
        item.setLastContactDate(request.lastContactDate());
        item.setFollowUpDate(request.followUpDate());
        item.setOfferDecisionDeadline(request.offerDecisionDeadline());
        return item;
    }
}
