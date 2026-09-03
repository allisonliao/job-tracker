package com.allisonliao.job_tracker_backend.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.allisonliao.job_tracker_backend.integration.MiniStackTestBase;
import com.allisonliao.job_tracker_backend.model.CompanyItem;

class CompanyRepositoryTest extends MiniStackTestBase {

    @Autowired
    private CompanyRepository companyRepository;

    private CompanyItem newCompany(String companyId, String name) {
        CompanyItem item = new CompanyItem();
        item.setPk("COMPANY#" + companyId);
        item.setSk("METADATA");
        item.setCompanyId(companyId);
        item.setName(name);
        item.setWebsite("https://example.com");
        item.setIndustry("Software");
        item.setNotes("test note");
        return item;
    }

    @Test
    void savesAndFindsCompanyById() {
        String companyId = UUID.randomUUID().toString();
        CompanyItem saved = companyRepository.save(newCompany(companyId, "Acme Corp"));

        Optional<CompanyItem> found = companyRepository.findById(companyId);

        assertThat(found).isPresent();
        assertThat(found.get().getCompanyId()).isEqualTo(companyId);
        assertThat(found.get().getName()).isEqualTo(saved.getName());
        assertThat(found.get().getWebsite()).isEqualTo("https://example.com");
    }

    @Test
    void returnsEmptyWhenCompanyDoesNotExist() {
        Optional<CompanyItem> found = companyRepository.findById(UUID.randomUUID().toString());

        assertThat(found).isEmpty();
    }

    @Test
    void findAllReturnsSavedCompanies() {
        String companyId1 = UUID.randomUUID().toString();
        String companyId2 = UUID.randomUUID().toString();
        companyRepository.save(newCompany(companyId1, "Company One"));
        companyRepository.save(newCompany(companyId2, "Company Two"));

        List<CompanyItem> all = companyRepository.findAll();

        assertThat(all)
                .extracting(CompanyItem::getCompanyId)
                .contains(companyId1, companyId2);
    }

    @Test
    void deletesCompanyById() {
        String companyId = UUID.randomUUID().toString();
        companyRepository.save(newCompany(companyId, "Temporary Co"));
        assertThat(companyRepository.findById(companyId)).isPresent();

        companyRepository.deleteById(companyId);

        assertThat(companyRepository.findById(companyId)).isEmpty();
    }
}
