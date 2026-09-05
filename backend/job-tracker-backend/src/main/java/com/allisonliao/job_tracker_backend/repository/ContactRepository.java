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
import com.allisonliao.job_tracker_backend.model.ContactItem;

@Repository
public class ContactRepository {

    private final DynamoDbTable<ContactItem> table;

    public ContactRepository(DynamoDbEnhancedClient enhancedClient, AwsProperties props) {
        this.table = enhancedClient.table(props.getTableName(), TableSchema.fromBean(ContactItem.class));
    }

    public ContactItem save(ContactItem item) {
        table.putItem(item);
        return item;
    }

    public Optional<ContactItem> findById(String companyId, String contactId) {
        Key key = Key.builder()
                .partitionValue("COMPANY#" + companyId)
                .sortValue("CONTACT#" + contactId)
                .build();
        return Optional.ofNullable(table.getItem(key));
    }

    public List<ContactItem> findAllForCompany(String companyId) {
        QueryConditional condition = QueryConditional.sortBeginsWith(
                Key.builder()
                        .partitionValue("COMPANY#" + companyId)
                        .sortValue("CONTACT#")
                        .build());

        return table.query(condition)
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    public void deleteById(String companyId, String contactId) {
        Key key = Key.builder()
                .partitionValue("COMPANY#" + companyId)
                .sortValue("CONTACT#" + contactId)
                .build();
        table.deleteItem(key);
    }
}
