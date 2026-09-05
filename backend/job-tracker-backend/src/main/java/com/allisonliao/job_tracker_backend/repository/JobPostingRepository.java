package com.allisonliao.job_tracker_backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import com.allisonliao.job_tracker_backend.config.AwsProperties;
import com.allisonliao.job_tracker_backend.model.JobPostingItem;

@Repository
public class JobPostingRepository {

    private final DynamoDbTable<JobPostingItem> table;

    public JobPostingRepository(DynamoDbEnhancedClient enhancedClient, AwsProperties props) {
        this.table = enhancedClient.table(props.getTableName(), TableSchema.fromBean(JobPostingItem.class));
    }

    public JobPostingItem save(JobPostingItem item) {
        table.putItem(item);
        return item;
    }

    public Optional<JobPostingItem> findById(String companyId, String jobId) {
        Key key = Key.builder()
                .partitionValue("COMPANY#" + companyId)
                .sortValue("JOB#" + jobId)
                .build();
        return Optional.ofNullable(table.getItem(key));
    }

    public List<JobPostingItem> findAllForCompany(String companyId) {
        QueryConditional condition = QueryConditional.sortBeginsWith(
                Key.builder()
                        .partitionValue("COMPANY#" + companyId)
                        .sortValue("JOB#")
                        .build());

        return table.query(condition)
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    public void deleteById(String companyId, String jobId) {
        Key key = Key.builder()
                .partitionValue("COMPANY#" + companyId)
                .sortValue("JOB#" + jobId)
                .build();
        table.deleteItem(key);
    }
}
