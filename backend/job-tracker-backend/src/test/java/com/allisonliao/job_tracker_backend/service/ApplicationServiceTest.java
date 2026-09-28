package com.allisonliao.job_tracker_backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.allisonliao.job_tracker_backend.model.ApplicationItem;
import com.allisonliao.job_tracker_backend.model.StatusChangeItem;
import com.allisonliao.job_tracker_backend.repository.ApplicationRepository;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Captor
    private ArgumentCaptor<ApplicationItem> applicationCaptor;

    @Captor
    private ArgumentCaptor<StatusChangeItem> statusChangeCaptor;

    private ApplicationService applicationService;

    private ApplicationService service() {
        return new ApplicationService(applicationRepository);
    }

    @Test
    void createPopulatesKeysAndGsiAttributes() {
        applicationService = service();
        when(applicationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ApplicationItem draft = new ApplicationItem();
        draft.setCompanyName("Acme Co");
        draft.setCurrentStatus("Applied");
        draft.setDateApplied(LocalDate.of(2026, 9, 1));

        ApplicationItem saved = applicationService.create(draft);

        assertThat(saved.getApplicationId()).isNotBlank();
        assertThat(saved.getPk()).isEqualTo("APPLICATION#" + saved.getApplicationId());
        assertThat(saved.getSk()).isEqualTo("METADATA");
        assertThat(saved.getGsi2Pk()).isEqualTo("STATUS#Applied");
        assertThat(saved.getGsi2Sk()).isEqualTo("2026-09-01");
        assertThat(saved.getGsi3Pk()).isNull();
        assertThat(saved.getGsi3Sk()).isNull();
    }

    @Test
    void createWithFollowUpDatePopulatesGsi3() {
        applicationService = service();
        when(applicationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ApplicationItem draft = new ApplicationItem();
        draft.setCompanyName("Acme Co");
        draft.setCurrentStatus("Applied");
        draft.setDateApplied(LocalDate.of(2026, 9, 1));
        draft.setFollowUpDate(LocalDate.of(2026, 9, 10));

        ApplicationItem saved = applicationService.create(draft);

        assertThat(saved.getGsi3Pk()).isEqualTo("FOLLOWUP");
        assertThat(saved.getGsi3Sk()).isEqualTo("2026-09-10");
    }

    @Test
    void changeStatusRecordsHistoryAndUpdatesCurrentStatusAndGsi2() {
        applicationService = service();
        ApplicationItem existing = new ApplicationItem();
        existing.setApplicationId("app-1");
        existing.setPk("APPLICATION#app-1");
        existing.setSk("METADATA");
        existing.setCompanyName("Acme Co");
        existing.setCurrentStatus("Applied");
        existing.setDateApplied(LocalDate.of(2026, 9, 1));

        when(applicationRepository.findById("app-1")).thenReturn(Optional.of(existing));
        when(applicationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ApplicationItem result = applicationService.changeStatus("app-1", "Interviewing", "Recruiter call scheduled");

        verify(applicationRepository).saveStatusChange(statusChangeCaptor.capture());
        StatusChangeItem recordedChange = statusChangeCaptor.getValue();
        assertThat(recordedChange.getFromStatus()).isEqualTo("Applied");
        assertThat(recordedChange.getToStatus()).isEqualTo("Interviewing");
        assertThat(recordedChange.getNote()).isEqualTo("Recruiter call scheduled");
        assertThat(recordedChange.getApplicationId()).isEqualTo("app-1");

        assertThat(result.getCurrentStatus()).isEqualTo("Interviewing");
        assertThat(result.getGsi2Pk()).isEqualTo("STATUS#Interviewing");
    }

    @Test
    void updateDoesNotAllowChangingStatusDirectly() {
        applicationService = service();
        ApplicationItem existing = new ApplicationItem();
        existing.setApplicationId("app-1");
        existing.setCompanyName("Acme Co");
        existing.setCurrentStatus("Applied");
        existing.setDateApplied(LocalDate.of(2026, 9, 1));

        when(applicationRepository.findById("app-1")).thenReturn(Optional.of(existing));
        when(applicationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ApplicationItem attemptedUpdate = new ApplicationItem();
        attemptedUpdate.setCompanyName("Acme Co");
        attemptedUpdate.setCurrentStatus("Offer"); // should be ignored by update()
        attemptedUpdate.setDateApplied(LocalDate.of(2026, 9, 1));
        attemptedUpdate.setLastContactDate(LocalDate.of(2026, 9, 15));

        ApplicationItem result = applicationService.update("app-1", attemptedUpdate);

        assertThat(result.getCurrentStatus()).isEqualTo("Applied");
        assertThat(result.getLastContactDate()).isEqualTo(LocalDate.of(2026, 9, 15));
    }
}
