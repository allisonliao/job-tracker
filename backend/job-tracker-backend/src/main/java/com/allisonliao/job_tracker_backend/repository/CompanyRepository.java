package com.allisonliao.job_tracker_backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import com.allisonliao.job_tracker_backend.config.AwsProperties;
import com.allisonliao.job_tracker_backend.model.CompanyItem;

@Repository
public class CompanyRepository {

    private final DynamoDbTable<CompanyItem> table;

    public CompanyRepository(DynamoDbEnhancedClient enhancedClient, AwsProperties props) {
        this.table = enhancedClient.table(props.getTableName(), TableSchema.fromBean(CompanyItem.class));
    }

    public CompanyItem save(CompanyItem item) {
        table.putItem(item);
        return item;
    }

    public Optional<CompanyItem> findById(String companyId) {
        Key key = Key.builder()
                .partitionValue("COMPANY#" + companyId)
                .sortValue("METADATA")
                .build();
        return Optional.ofNullable(table.getItem(key));
    }

    public List<CompanyItem> findAll() {
        Expression filterExpression = Expression.builder()
                .expression("SK = :sk AND begins_with(PK, :pkPrefix)")
                .putExpressionValue(":sk", AttributeValue.builder().s("METADATA").build())
                .putExpressionValue(":pkPrefix", AttributeValue.builder().s("COMPANY#").build())
                .build();

        ScanEnhancedRequest scanRequest = ScanEnhancedRequest.builder()
                .filterExpression(filterExpression)
                .build();

        return table.scan(scanRequest)
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    public void deleteById(String companyId) {
        Key key = Key.builder()
                .partitionValue("COMPANY#" + companyId)
                .sortValue("METADATA")
                .build();
        table.deleteItem(key);
    }
}
