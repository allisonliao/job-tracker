package com.allisonliao.job_tracker_backend.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.allisonliao.job_tracker_backend.integration.MiniStackTestBase;
import com.allisonliao.job_tracker_backend.model.ApplicationItem;
import com.allisonliao.job_tracker_backend.model.InterviewItem;
import com.allisonliao.job_tracker_backend.model.NoteItem;
import com.allisonliao.job_tracker_backend.model.StatusChangeItem;

class ApplicationRepositoryTest extends MiniStackTestBase {

    @Autowired
    private ApplicationRepository applicationRepository;

    private ApplicationItem newApplication(String applicationId, String companyId, String status,
                                            LocalDate dateApplied, LocalDate followUpDate) {
        ApplicationItem item = new ApplicationItem();
        item.setPk("APPLICATION#" + applicationId);
        item.setSk("METADATA");
        item.setApplicationId(applicationId);
        item.setCompanyId(companyId);
        item.setJobPostingId(UUID.randomUUID().toString());
        item.setCurrentStatus(status);
        item.setDateApplied(dateApplied);

        item.setGsi1Pk("COMPANY#" + companyId);
        item.setGsi1Sk("APPLICATION#" + applicationId);
        item.setGsi2Pk("STATUS#" + status);
        item.setGsi2Sk(dateApplied.toString());

        if (followUpDate != null) {
            item.setFollowUpDate(followUpDate);
            item.setGsi3Pk("FOLLOWUP");
            item.setGsi3Sk(followUpDate.toString());
        }

        return item;
    }

    @Test
    void savesAndFindsApplicationById() {
        String applicationId = UUID.randomUUID().toString();
        String companyId = UUID.randomUUID().toString();
        applicationRepository.save(newApplication(applicationId, companyId, "Applied",
                LocalDate.of(2026, 9, 1), null));

        Optional<ApplicationItem> found = applicationRepository.findById(applicationId);

        assertThat(found).isPresent();
        assertThat(found.get().getCurrentStatus()).isEqualTo("Applied");
    }

    @Test
    void findAllForCompanyUsesGsi1() {
        String companyId = UUID.randomUUID().toString();
        String otherCompanyId = UUID.randomUUID().toString();
        String app1 = UUID.randomUUID().toString();
        String app2 = UUID.randomUUID().toString();
        String otherApp = UUID.randomUUID().toString();

        applicationRepository.save(newApplication(app1, companyId, "Applied", LocalDate.of(2026, 9, 1), null));
        applicationRepository.save(newApplication(app2, companyId, "Interviewing", LocalDate.of(2026, 9, 2), null));
        applicationRepository.save(newApplication(otherApp, otherCompanyId, "Applied", LocalDate.of(2026, 9, 1), null));

        List<ApplicationItem> results = applicationRepository.findAllForCompany(companyId);

        assertThat(results)
                .extracting(ApplicationItem::getApplicationId)
                .containsExactlyInAnyOrder(app1, app2);
    }

    @Test
    void findByStatusUsesGsi2() {
        String companyId = UUID.randomUUID().toString();
        String statusValue = "Offer-" + UUID.randomUUID(); // unique per test run to avoid cross-test collisions
        String app1 = UUID.randomUUID().toString();
        String app2 = UUID.randomUUID().toString();

        applicationRepository.save(newApplication(app1, companyId, statusValue, LocalDate.of(2026, 9, 1), null));
        applicationRepository.save(newApplication(app2, companyId, "Applied", LocalDate.of(2026, 9, 2), null));

        List<ApplicationItem> results = applicationRepository.findByStatus(statusValue);

        assertThat(results)
                .extracting(ApplicationItem::getApplicationId)
                .containsExactly(app1);
    }

    @Test
    void findFollowUpsDueByReturnsOnlyApplicationsWithFollowUpOnOrBeforeCutoff() {
        String companyId = UUID.randomUUID().toString();
        String dueSoon = UUID.randomUUID().toString();
        String dueLater = UUID.randomUUID().toString();
        String noFollowUp = UUID.randomUUID().toString();

        applicationRepository.save(newApplication(dueSoon, companyId, "Applied",
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5)));
        applicationRepository.save(newApplication(dueLater, companyId, "Applied",
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 12, 1)));
        applicationRepository.save(newApplication(noFollowUp, companyId, "Applied",
                LocalDate.of(2026, 9, 1), null));

        List<ApplicationItem> results = applicationRepository.findFollowUpsDueBy(LocalDate.of(2026, 9, 10));

        assertThat(results)
                .extracting(ApplicationItem::getApplicationId)
                .contains(dueSoon)
                .doesNotContain(dueLater, noFollowUp);
    }

    @Test
    void applicationWithoutFollowUpDateIsNotInGsi3() {
        // This directly verifies the GSI3 sparsity assumption flagged during planning:
        // an application with no followUpDate must not appear in the byFollowUp index
        // at all, even when queried with a cutoff far in the future.
        String companyId = UUID.randomUUID().toString();
        String applicationId = UUID.randomUUID().toString();
        applicationRepository.save(newApplication(applicationId, companyId, "Applied",
                LocalDate.of(2026, 9, 1), null));

        List<ApplicationItem> results = applicationRepository.findFollowUpsDueBy(LocalDate.of(2099, 1, 1));

        assertThat(results)
                .extracting(ApplicationItem::getApplicationId)
                .doesNotContain(applicationId);
    }

    @Test
    void savesAndFindsInterviewsInOrder() {
        String applicationId = UUID.randomUUID().toString();
        InterviewItem first = new InterviewItem();
        first.setPk("APPLICATION#" + applicationId);
        Instant firstTime = Instant.parse("2026-09-10T14:00:00Z");
        first.setSk("INTERVIEW#" + firstTime);
        first.setApplicationId(applicationId);
        first.setInterviewDate(firstTime);
        first.setRoundType("Phone Screen");

        InterviewItem second = new InterviewItem();
        Instant secondTime = Instant.parse("2026-09-20T10:00:00Z");
        second.setPk("APPLICATION#" + applicationId);
        second.setSk("INTERVIEW#" + secondTime);
        second.setApplicationId(applicationId);
        second.setInterviewDate(secondTime);
        second.setRoundType("Onsite");

        applicationRepository.saveInterview(second);
        applicationRepository.saveInterview(first);

        List<InterviewItem> results = applicationRepository.findInterviews(applicationId);

        assertThat(results).extracting(InterviewItem::getRoundType)
                .containsExactly("Phone Screen", "Onsite");
    }

    @Test
    void savesAndFindsStatusHistory() {
        String applicationId = UUID.randomUUID().toString();
        StatusChangeItem change = new StatusChangeItem();
        Instant changedAt = Instant.parse("2026-09-05T09:00:00Z");
        change.setPk("APPLICATION#" + applicationId);
        change.setSk("STATUSCHANGE#" + changedAt);
        change.setApplicationId(applicationId);
        change.setChangedAt(changedAt);
        change.setFromStatus("Applied");
        change.setToStatus("Interviewing");

        applicationRepository.saveStatusChange(change);

        List<StatusChangeItem> results = applicationRepository.findStatusHistory(applicationId);

        assertThat(results).extracting(StatusChangeItem::getToStatus).containsExactly("Interviewing");
    }

    @Test
    void savesAndFindsNotes() {
        String applicationId = UUID.randomUUID().toString();
        NoteItem note = new NoteItem();
        Instant createdAt = Instant.parse("2026-09-06T08:30:00Z");
        note.setPk("APPLICATION#" + applicationId);
        note.setSk("NOTE#" + createdAt);
        note.setApplicationId(applicationId);
        note.setCreatedAt(createdAt);
        note.setText("Recruiter mentioned team is remote-friendly");

        applicationRepository.saveNote(note);

        List<NoteItem> results = applicationRepository.findNotes(applicationId);

        assertThat(results).extracting(NoteItem::getText)
                .containsExactly("Recruiter mentioned team is remote-friendly");
    }
}
