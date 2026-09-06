package com.allisonliao.job_tracker_backend.integration;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.allisonliao.job_tracker_backend.dto.ApplicationRequest;
import com.allisonliao.job_tracker_backend.dto.CompanyRequest;
import com.allisonliao.job_tracker_backend.dto.InterviewRequest;
import com.allisonliao.job_tracker_backend.dto.NoteRequest;
import com.allisonliao.job_tracker_backend.dto.StatusChangeRequest;
import tools.jackson.databind.ObjectMapper;

class ApplicationApiIT extends MiniStackTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String createCompany() throws Exception {
        CompanyRequest company = new CompanyRequest("Application Test Co " + UUID.randomUUID(), null, null, null);
        String body = mockMvc.perform(post("/api/companies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(company)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("companyId").asText();
    }

    private String createApplication(String companyId, String status, LocalDate dateApplied, LocalDate followUpDate) throws Exception {
        ApplicationRequest request = new ApplicationRequest(companyId, null, status, dateApplied, null, followUpDate, null);
        String body = mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("applicationId").asText();
    }

    @Test
    void fullCrudLifecycleThroughTheRealApi() throws Exception {
        String companyId = createCompany();
        String applicationId = createApplication(companyId, "Applied", LocalDate.of(2026, 9, 1), null);

        mockMvc.perform(get("/api/applications/" + applicationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStatus").value("Applied"))
                .andExpect(jsonPath("$.interviews").isEmpty())
                .andExpect(jsonPath("$.statusHistory").isEmpty())
                .andExpect(jsonPath("$.notes").isEmpty());

        ApplicationRequest updateRequest = new ApplicationRequest(
                companyId, null, "Applied", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5), null, null);
        mockMvc.perform(put("/api/applications/" + applicationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastContactDate").value("2026-09-05"));

        mockMvc.perform(delete("/api/applications/" + applicationId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/applications/" + applicationId))
                .andExpect(status().isNotFound());
    }

    @Test
    void changeStatusRecordsHistoryAndIsReflectedInDetailAndListByStatus() throws Exception {
        String companyId = createCompany();
        String applicationId = createApplication(companyId, "Applied", LocalDate.of(2026, 9, 1), null);

        StatusChangeRequest statusChange = new StatusChangeRequest("Interviewing", "Recruiter call scheduled");
        mockMvc.perform(post("/api/applications/" + applicationId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusChange)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStatus").value("Interviewing"));

        mockMvc.perform(get("/api/applications/" + applicationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStatus").value("Interviewing"))
                .andExpect(jsonPath("$.statusHistory[0].fromStatus").value("Applied"))
                .andExpect(jsonPath("$.statusHistory[0].toStatus").value("Interviewing"));

        mockMvc.perform(get("/api/applications").param("status", "Interviewing"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].applicationId", hasItem(applicationId)));
    }

    @Test
    void addsInterviewsAndNotesVisibleInDetail() throws Exception {
        String companyId = createCompany();
        String applicationId = createApplication(companyId, "Interviewing", LocalDate.of(2026, 9, 1), null);

        InterviewRequest interview = new InterviewRequest(Instant.parse("2026-09-10T14:00:00Z"), "Phone Screen", "Went well");
        mockMvc.perform(post("/api/applications/" + applicationId + "/interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(interview)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roundType").value("Phone Screen"));

        NoteRequest note = new NoteRequest("Team seems remote-friendly");
        mockMvc.perform(post("/api/applications/" + applicationId + "/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(note)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.text").value("Team seems remote-friendly"));

        mockMvc.perform(get("/api/applications/" + applicationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.interviews[0].roundType").value("Phone Screen"))
                .andExpect(jsonPath("$.notes[0].text").value("Team seems remote-friendly"));
    }

    @Test
    void listsApplicationsForCompanyAndForAllUnfiltered() throws Exception {
        String companyId = createCompany();
        String otherCompanyId = createCompany();
        String app1 = createApplication(companyId, "Applied", LocalDate.of(2026, 9, 1), null);
        String app2 = createApplication(companyId, "Applied", LocalDate.of(2026, 9, 2), null);
        String otherCompanyApp = createApplication(otherCompanyId, "Applied", LocalDate.of(2026, 9, 1), null);

        mockMvc.perform(get("/api/applications").param("companyId", companyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].applicationId", hasItem(app1)))
                .andExpect(jsonPath("$[*].applicationId", hasItem(app2)))
                .andExpect(jsonPath("$[*].applicationId", org.hamcrest.Matchers.not(hasItem(otherCompanyApp))));

        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].applicationId", hasItem(app1)))
                .andExpect(jsonPath("$[*].applicationId", hasItem(app2)))
                .andExpect(jsonPath("$[*].applicationId", hasItem(otherCompanyApp)));
    }

    @Test
    void upcomingReturnsOnlyApplicationsDueByCutoff() throws Exception {
        String companyId = createCompany();
        String dueSoon = createApplication(companyId, "Applied", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5));
        String dueLater = createApplication(companyId, "Applied", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 12, 1));

        mockMvc.perform(get("/api/applications/upcoming").param("dueBy", "2026-09-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].applicationId", hasItem(dueSoon)));

        mockMvc.perform(get("/api/applications/upcoming").param("dueBy", "2026-09-10"))
                .andExpect(jsonPath("$[*].applicationId").value(org.hamcrest.Matchers.not(hasItem(dueLater))));
    }
}
