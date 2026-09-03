package com.allisonliao.job_tracker_backend.config;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;
import software.amazon.awssdk.services.dynamodb.waiters.DynamoDbWaiter;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("local")
public class TableBootstrapper implements ApplicationRunner {

    private final DynamoDbClient client;
    private final AwsProperties props;

    public TableBootstrapper(DynamoDbClient client, AwsProperties props) {
        this.client = client;
        this.props = props;
    }

    @Override
    public void run(ApplicationArguments args) {
        createTableIfNotExists(client, props.getTableName());
    }

    /**
     * Idempotent: creates the table with its 3 GSIs if it doesn't already exist.
     * Shared by the {@code local}-profile startup runner above and by integration
     * tests (e.g. MiniStackTestBase), so table schema never drifts between the two.
     */
    public static void createTableIfNotExists(DynamoDbClient client, String tableName) {
        try {
            client.describeTable(DescribeTableRequest.builder().tableName(tableName).build());
            return; // already exists, nothing to do
        } catch (ResourceNotFoundException e) {
            // fall through and create it
        }

        client.createTable(CreateTableRequest.builder()
                .tableName(tableName)
                .billingMode(BillingMode.PAY_PER_REQUEST)
                .attributeDefinitions(
                        attr("PK"), attr("SK"),
                        attr("GSI1PK"), attr("GSI1SK"),
                        attr("GSI2PK"), attr("GSI2SK"),
                        attr("GSI3PK"), attr("GSI3SK"))
                .keySchema(
                        key("PK", KeyType.HASH),
                        key("SK", KeyType.RANGE))
                .globalSecondaryIndexes(
                        gsi("GSI1", "GSI1PK", "GSI1SK"),
                        gsi("GSI2", "GSI2PK", "GSI2SK"),
                        gsi("GSI3", "GSI3PK", "GSI3SK"))
                .build());

        try (DynamoDbWaiter waiter = client.waiter()) {
            waiter.waitUntilTableExists(DescribeTableRequest.builder().tableName(tableName).build());
        }
    }

    private static AttributeDefinition attr(String name) {
        return AttributeDefinition.builder().attributeName(name).attributeType(ScalarAttributeType.S).build();
    }

    private static KeySchemaElement key(String name, KeyType type) {
        return KeySchemaElement.builder().attributeName(name).keyType(type).build();
    }

    private static GlobalSecondaryIndex gsi(String indexName, String pk, String sk) {
        return GlobalSecondaryIndex.builder()
                .indexName(indexName)
                .keySchema(key(pk, KeyType.HASH), key(sk, KeyType.RANGE))
                .projection(Projection.builder().projectionType(ProjectionType.ALL).build())
                .build();
    }
}