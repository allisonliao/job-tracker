package com.allisonliao.job_tracker_backend.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.allisonliao.job_tracker_backend.dto.CompanyRequest;
import com.allisonliao.job_tracker_backend.dto.JobPostingRequest;
import tools.jackson.databind.ObjectMapper;

class JobPostingApiIT extends MiniStackTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String createCompany() throws Exception {
        CompanyRequest company = new CompanyRequest("Job Posting Test Co", null, null, null);
        String body = mockMvc.perform(post("/api/companies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(company)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("companyId").asText();
    }

    @Test
    void fullCrudLifecycleThroughTheRealApi() throws Exception {
        String companyId = createCompany();
        JobPostingRequest createRequest = new JobPostingRequest(
                "Backend Engineer", "https://example.com/job", "Remote",
                java.time.LocalDate.of(2026, 9, 1), java.time.LocalDate.of(2026, 9, 30));

        String createBody = mockMvc.perform(post("/api/companies/" + companyId + "/job-postings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Backend Engineer"))
                .andReturn().getResponse().getContentAsString();
        String jobId = objectMapper.readTree(createBody).get("jobId").asText();

        mockMvc.perform(get("/api/companies/" + companyId + "/job-postings/" + jobId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Backend Engineer"));

        JobPostingRequest updateRequest = new JobPostingRequest(
                "Senior Backend Engineer", "https://example.com/job", "Remote",
                java.time.LocalDate.of(2026, 9, 1), java.time.LocalDate.of(2026, 9, 30));
        mockMvc.perform(put("/api/companies/" + companyId + "/job-postings/" + jobId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Senior Backend Engineer"));

        mockMvc.perform(get("/api/companies/" + companyId + "/job-postings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].jobId").value(jobId));

        mockMvc.perform(delete("/api/companies/" + companyId + "/job-postings/" + jobId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/companies/" + companyId + "/job-postings/" + jobId))
                .andExpect(status().isNotFound());
    }
}
