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
import com.allisonliao.job_tracker_backend.dto.ContactRequest;
import tools.jackson.databind.ObjectMapper;

class ContactApiIT extends MiniStackTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String createCompany() throws Exception {
        CompanyRequest company = new CompanyRequest("Contact Test Co", null, null, null);
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
        ContactRequest createRequest = new ContactRequest("Jane Recruiter", "Recruiter", "jane@example.com", "555-0100");

        String createBody = mockMvc.perform(post("/api/companies/" + companyId + "/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Jane Recruiter"))
                .andReturn().getResponse().getContentAsString();
        String contactId = objectMapper.readTree(createBody).get("contactId").asText();

        mockMvc.perform(get("/api/companies/" + companyId + "/contacts/" + contactId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("jane@example.com"));

        ContactRequest updateRequest = new ContactRequest("Jane Senior Recruiter", "Recruiter", "jane@example.com", "555-0100");
        mockMvc.perform(put("/api/companies/" + companyId + "/contacts/" + contactId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Jane Senior Recruiter"));

        mockMvc.perform(get("/api/companies/" + companyId + "/contacts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].contactId").value(contactId));

        mockMvc.perform(delete("/api/companies/" + companyId + "/contacts/" + contactId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/companies/" + companyId + "/contacts/" + contactId))
                .andExpect(status().isNotFound());
    }
}
