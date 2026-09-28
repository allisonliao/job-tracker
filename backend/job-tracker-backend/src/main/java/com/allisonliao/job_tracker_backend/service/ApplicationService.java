package com.allisonliao.job_tracker_backend.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.allisonliao.job_tracker_backend.model.ApplicationItem;
import com.allisonliao.job_tracker_backend.model.InterviewItem;
import com.allisonliao.job_tracker_backend.model.NoteItem;
import com.allisonliao.job_tracker_backend.model.StatusChangeItem;
import com.allisonliao.job_tracker_backend.repository.ApplicationRepository;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public ApplicationService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    public ApplicationItem create(ApplicationItem draft) {
        String applicationId = UUID.randomUUID().toString();
        draft.setApplicationId(applicationId);
        draft.setPk("APPLICATION#" + applicationId);
        draft.setSk("METADATA");
        populateGsiAttributes(draft);
        return applicationRepository.save(draft);
    }

    public Optional<ApplicationItem> getById(String applicationId) {
        return applicationRepository.findById(applicationId);
    }

    /**
     * Updates the non-status fields of an application (dates, applicationLink, etc).
     * Status changes must go through {@link #changeStatus} instead, since those
     * also need to append a StatusChangeItem to the history.
     */
    public ApplicationItem update(String applicationId, ApplicationItem updated) {
        ApplicationItem existing = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NoSuchElementException("Application not found: " + applicationId));

        updated.setApplicationId(applicationId);
        updated.setPk("APPLICATION#" + applicationId);
        updated.setSk("METADATA");
        updated.setCurrentStatus(existing.getCurrentStatus()); // status is changed only via changeStatus
        populateGsiAttributes(updated);
        return applicationRepository.save(updated);
    }

    /**
     * Records a status transition: appends an immutable StatusChangeItem to the
     * application's history, then updates currentStatus (and GSI2, which is
     * keyed on status) on the metadata item.
     */
    public ApplicationItem changeStatus(String applicationId, String newStatus, String note) {
        ApplicationItem existing = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NoSuchElementException("Application not found: " + applicationId));

        Instant changedAt = Instant.now();
        StatusChangeItem change = new StatusChangeItem();
        change.setPk("APPLICATION#" + applicationId);
        change.setSk("STATUSCHANGE#" + changedAt);
        change.setApplicationId(applicationId);
        change.setChangedAt(changedAt);
        change.setFromStatus(existing.getCurrentStatus());
        change.setToStatus(newStatus);
        change.setNote(note);
        applicationRepository.saveStatusChange(change);

        existing.setCurrentStatus(newStatus);
        populateGsiAttributes(existing);
        return applicationRepository.save(existing);
    }

    public void delete(String applicationId) {
        applicationRepository.deleteById(applicationId);
    }

    public List<ApplicationItem> listAll() {
        return applicationRepository.findAll();
    }

    public List<ApplicationItem> listByStatus(String status) {
        return applicationRepository.findByStatus(status);
    }

    public List<ApplicationItem> listFollowUpsDueBy(LocalDate cutoff) {
        return applicationRepository.findFollowUpsDueBy(cutoff);
    }

    public List<StatusChangeItem> getStatusHistory(String applicationId) {
        return applicationRepository.findStatusHistory(applicationId);
    }

    public InterviewItem addInterview(String applicationId, InterviewItem draft) {
        draft.setApplicationId(applicationId);
        draft.setPk("APPLICATION#" + applicationId);
        draft.setSk("INTERVIEW#" + draft.getInterviewDate());
        return applicationRepository.saveInterview(draft);
    }

    public List<InterviewItem> getInterviews(String applicationId) {
        return applicationRepository.findInterviews(applicationId);
    }

    public NoteItem addNote(String applicationId, NoteItem draft) {
        Instant createdAt = Instant.now();
        draft.setApplicationId(applicationId);
        draft.setPk("APPLICATION#" + applicationId);
        draft.setCreatedAt(createdAt);
        draft.setSk("NOTE#" + createdAt);
        return applicationRepository.saveNote(draft);
    }

    public List<NoteItem> getNotes(String applicationId) {
        return applicationRepository.findNotes(applicationId);
    }

    /**
     * Recomputes both GSI attribute pairs from the item's own fields. Called before
     * every save so the indexes never drift out of sync with currentStatus/followUpDate.
     * GSI3 is left unset (null) when there's no followUpDate — verified by
     * ApplicationRepositoryTest to keep that index correctly sparse.
     */
    private void populateGsiAttributes(ApplicationItem item) {
        item.setGsi2Pk("STATUS#" + item.getCurrentStatus());
        item.setGsi2Sk(item.getDateApplied() != null ? item.getDateApplied().toString() : null);

        if (item.getFollowUpDate() != null) {
            item.setGsi3Pk("FOLLOWUP");
            item.setGsi3Sk(item.getFollowUpDate().toString());
        } else {
            item.setGsi3Pk(null);
            item.setGsi3Sk(null);
        }
    }
}
