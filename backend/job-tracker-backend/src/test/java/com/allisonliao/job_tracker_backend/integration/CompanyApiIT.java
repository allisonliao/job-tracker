package com.allisonliao.job_tracker_backend.integration;

import static org.hamcrest.Matchers.hasItem;
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
import tools.jackson.databind.ObjectMapper;

class CompanyApiIT extends MiniStackTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void fullCrudLifecycleThroughTheRealApi() throws Exception {
        CompanyRequest createRequest = new CompanyRequest("Acme Corp", "https://acme.example", "Software", "great culture");

        String createResponseBody = mockMvc.perform(post("/api/companies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Acme Corp"))
                .andReturn().getResponse().getContentAsString();

        String companyId = objectMapper.readTree(createResponseBody).get("companyId").asText();

        mockMvc.perform(get("/api/companies/" + companyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Acme Corp"));

        CompanyRequest updateRequest = new CompanyRequest("Acme Corp Updated", "https://acme.example", "Software", "updated notes");
        mockMvc.perform(put("/api/companies/" + companyId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Acme Corp Updated"));

        mockMvc.perform(get("/api/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].companyId", hasItem(companyId)));

        mockMvc.perform(delete("/api/companies/" + companyId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/companies/" + companyId))
                .andExpect(status().isNotFound());
    }

    @Test
    void returns404ForUnknownCompany() throws Exception {
        mockMvc.perform(get("/api/companies/does-not-exist"))
                .andExpect(status().isNotFound());
    }

    @Test
    void returns400ForInvalidRequestBody() throws Exception {
        CompanyRequest invalidRequest = new CompanyRequest("", null, null, null); // name is @NotBlank

        mockMvc.perform(post("/api/companies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}
