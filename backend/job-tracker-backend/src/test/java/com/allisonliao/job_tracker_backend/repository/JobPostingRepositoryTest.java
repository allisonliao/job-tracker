package com.allisonliao.job_tracker_backend.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.allisonliao.job_tracker_backend.integration.MiniStackTestBase;
import com.allisonliao.job_tracker_backend.model.JobPostingItem;

class JobPostingRepositoryTest extends MiniStackTestBase {

    @Autowired
    private JobPostingRepository jobPostingRepository;

    private JobPostingItem newJobPosting(String companyId, String jobId, String title) {
        JobPostingItem item = new JobPostingItem();
        item.setPk("COMPANY#" + companyId);
        item.setSk("JOB#" + jobId);
        item.setCompanyId(companyId);
        item.setJobId(jobId);
        item.setTitle(title);
        item.setUrl("https://example.com/job/" + jobId);
        item.setLocation("Remote");
        item.setDateFound(LocalDate.of(2026, 9, 1));
        item.setApplicationDeadline(LocalDate.of(2026, 9, 30));
        return item;
    }

    @Test
    void savesAndFindsJobPostingById() {
        String companyId = UUID.randomUUID().toString();
        String jobId = UUID.randomUUID().toString();
        jobPostingRepository.save(newJobPosting(companyId, jobId, "Backend Engineer"));

        Optional<JobPostingItem> found = jobPostingRepository.findById(companyId, jobId);

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Backend Engineer");
        assertThat(found.get().getDateFound()).isEqualTo(LocalDate.of(2026, 9, 1));
    }

    @Test
    void findAllForCompanyReturnsOnlyThatCompanysPostings() {
        String companyId = UUID.randomUUID().toString();
        String otherCompanyId = UUID.randomUUID().toString();
        String jobId1 = UUID.randomUUID().toString();
        String jobId2 = UUID.randomUUID().toString();
        String otherJobId = UUID.randomUUID().toString();

        jobPostingRepository.save(newJobPosting(companyId, jobId1, "Backend Engineer"));
        jobPostingRepository.save(newJobPosting(companyId, jobId2, "Frontend Engineer"));
        jobPostingRepository.save(newJobPosting(otherCompanyId, otherJobId, "Should Not Appear"));

        List<JobPostingItem> results = jobPostingRepository.findAllForCompany(companyId);

        assertThat(results)
                .extracting(JobPostingItem::getJobId)
                .containsExactlyInAnyOrder(jobId1, jobId2);
    }

    @Test
    void deletesJobPostingById() {
        String companyId = UUID.randomUUID().toString();
        String jobId = UUID.randomUUID().toString();
        jobPostingRepository.save(newJobPosting(companyId, jobId, "Temporary Posting"));
        assertThat(jobPostingRepository.findById(companyId, jobId)).isPresent();

        jobPostingRepository.deleteById(companyId, jobId);

        assertThat(jobPostingRepository.findById(companyId, jobId)).isEmpty();
    }
}
