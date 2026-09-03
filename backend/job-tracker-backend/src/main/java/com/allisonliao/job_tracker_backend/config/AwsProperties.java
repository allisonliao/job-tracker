package com.allisonliao.job_tracker_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.aws")
public class AwsProperties {
    private String region;
    private String dynamoDbEndpoint;
    private String tableName;

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getDynamoDbEndpoint() {
        return dynamoDbEndpoint;
    }

    public void setDynamoDbEndpoint(String dynamoDbEndpoint) {
        this.dynamoDbEndpoint = dynamoDbEndpoint;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }
}