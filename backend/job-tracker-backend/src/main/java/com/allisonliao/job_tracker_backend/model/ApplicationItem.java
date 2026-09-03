package com.allisonliao.job_tracker_backend.model;

import java.time.LocalDate;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondarySortKey;

@DynamoDbBean
public class ApplicationItem {
    // core fields
    private String pk;
    private String sk;
    private String applicationId;
    private String companyId;
    private String jobPostingId;
    private String currentStatus;
    private LocalDate dateApplied;
    private LocalDate lastContactDate;
    private LocalDate followUpDate;
    private LocalDate offerDecisionDeadline;

    // gsi fields
    private String gsi1Pk;
    private String gsi1Sk;
    private String gsi2Pk;
    private String gsi2Sk;
    private String gsi3Pk;
    private String gsi3Sk;

    // getters setters
    @DynamoDbPartitionKey
    public String getPk() { return pk; }
    public void setPk(String pk) { this.pk = pk; }

    @DynamoDbSortKey
    public String getSk() { return sk; }
    public void setSk(String sk) { this.sk = sk; }

    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getJobPostingId() { return jobPostingId; }
    public void setJobPostingId(String jobPostingId) { this.jobPostingId = jobPostingId; }

    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }

    public LocalDate getDateApplied() { return dateApplied; }
    public void setDateApplied(LocalDate dateApplied) { this.dateApplied = dateApplied; }

    public LocalDate getLastContactDate() { return lastContactDate; }
    public void setLastContactDate(LocalDate lastContactDate) { this.lastContactDate = lastContactDate; }

    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }

    public LocalDate getOfferDecisionDeadline() { return offerDecisionDeadline; }
    public void setOfferDecisionDeadline(LocalDate offerDecisionDeadline) { this.offerDecisionDeadline = offerDecisionDeadline; }

    @DynamoDbSecondaryPartitionKey(indexNames = "GSI1")
    public String getGsi1Pk() { return gsi1Pk; }
    public void setGsi1Pk(String gsi1Pk) { this.gsi1Pk = gsi1Pk; }

    @DynamoDbSecondarySortKey(indexNames = "GSI1")
    public String getGsi1Sk() { return gsi1Sk; }
    public void setGsi1Sk(String gsi1Sk) { this.gsi1Sk = gsi1Sk; }

    @DynamoDbSecondaryPartitionKey(indexNames = "GSI2")
    public String getGsi2Pk() { return gsi2Pk; }
    public void setGsi2Pk(String gsi2Pk) { this.gsi2Pk = gsi2Pk; }

    @DynamoDbSecondarySortKey(indexNames = "GSI2")
    public String getGsi2Sk() { return gsi2Sk; }
    public void setGsi2Sk(String gsi2Sk) { this.gsi2Sk = gsi2Sk; }

    @DynamoDbSecondaryPartitionKey(indexNames = "GSI3")
    public String getGsi3Pk() { return gsi3Pk; }
    public void setGsi3Pk(String gsi3Pk) { this.gsi3Pk = gsi3Pk; }

    @DynamoDbSecondarySortKey(indexNames = "GSI3")
    public String getGsi3Sk() { return gsi3Sk; }
    public void setGsi3Sk(String gsi3Sk) { this.gsi3Sk = gsi3Sk; }
}
