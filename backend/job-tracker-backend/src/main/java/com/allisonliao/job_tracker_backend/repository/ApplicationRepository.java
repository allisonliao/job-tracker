package com.allisonliao.job_tracker_backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import com.allisonliao.job_tracker_backend.config.AwsProperties;
import com.allisonliao.job_tracker_backend.model.ApplicationItem;
import com.allisonliao.job_tracker_backend.model.InterviewItem;
import com.allisonliao.job_tracker_backend.model.NoteItem;
import com.allisonliao.job_tracker_backend.model.StatusChangeItem;

@Repository
public class ApplicationRepository {

    private final DynamoDbTable<ApplicationItem> applicationTable;
    private final DynamoDbIndex<ApplicationItem> byStatusIndex;
    private final DynamoDbIndex<ApplicationItem> byFollowUpIndex;

    private final DynamoDbTable<InterviewItem> interviewTable;
    private final DynamoDbTable<StatusChangeItem> statusChangeTable;
    private final DynamoDbTable<NoteItem> noteTable;

    public ApplicationRepository(DynamoDbEnhancedClient enhancedClient, AwsProperties props) {
        String tableName = props.getTableName();
        this.applicationTable = enhancedClient.table(tableName, TableSchema.fromBean(ApplicationItem.class));
        this.byStatusIndex = applicationTable.index("GSI2");
        this.byFollowUpIndex = applicationTable.index("GSI3");

        this.interviewTable = enhancedClient.table(tableName, TableSchema.fromBean(InterviewItem.class));
        this.statusChangeTable = enhancedClient.table(tableName, TableSchema.fromBean(StatusChangeItem.class));
        this.noteTable = enhancedClient.table(tableName, TableSchema.fromBean(NoteItem.class));
    }

    // --- Application metadata ---

    public ApplicationItem save(ApplicationItem item) {
        // NOTE: relying on the Enhanced Client's default putItem null-handling to keep
        // GSI3 sparse (an application with no followUpDate should have no gsi3Pk/gsi3Sk
        // attribute at all, so it never appears in the byFollowUp index). This is verified
        // directly by ApplicationRepositoryTest.applicationWithoutFollowUpDateIsNotInGsi3 —
        // PutItemEnhancedRequest.Builder has no ignoreNulls() option in this SDK version,
        // unlike UpdateItemEnhancedRequest, so we can't request the behavior explicitly;
        // the test is what actually confirms it, not this comment.
        applicationTable.putItem(item);
        return item;
    }

    public Optional<ApplicationItem> findById(String applicationId) {
        Key key = Key.builder()
                .partitionValue("APPLICATION#" + applicationId)
                .sortValue("METADATA")
                .build();
        return Optional.ofNullable(applicationTable.getItem(key));
    }

    public void deleteById(String applicationId) {
        Key key = Key.builder()
                .partitionValue("APPLICATION#" + applicationId)
                .sortValue("METADATA")
                .build();
        applicationTable.deleteItem(key);
    }

    /** All applications, unfiltered — Scan+filter over the whole table. */
    public List<ApplicationItem> findAll() {
        Expression filterExpression = Expression.builder()
                .expression("SK = :sk AND begins_with(PK, :pkPrefix)")
                .putExpressionValue(":sk", AttributeValue.builder().s("METADATA").build())
                .putExpressionValue(":pkPrefix", AttributeValue.builder().s("APPLICATION#").build())
                .build();

        ScanEnhancedRequest scanRequest = ScanEnhancedRequest.builder()
                .filterExpression(filterExpression)
                .build();

        return applicationTable.scan(scanRequest)
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    // --- GSI-backed access patterns ---

    public List<ApplicationItem> findByStatus(String status) {
        QueryConditional condition = QueryConditional.keyEqualTo(
                Key.builder().partitionValue("STATUS#" + status).build());
        return byStatusIndex.query(condition).stream()
                .flatMap(page -> page.items().stream())
                .collect(Collectors.toList());
    }

    /** Applications with a followUpDate on or before {@code cutoff} (e.g. today = due/overdue), soonest first. */
    public List<ApplicationItem> findFollowUpsDueBy(LocalDate cutoff) {
        QueryConditional condition = QueryConditional.sortLessThanOrEqualTo(
                Key.builder()
                        .partitionValue("FOLLOWUP")
                        .sortValue(cutoff.toString())
                        .build());
        return byFollowUpIndex.query(condition).stream()
                .flatMap(page -> page.items().stream())
                .collect(Collectors.toList());
    }

    // --- Interview sub-items ---

    public InterviewItem saveInterview(InterviewItem item) {
        interviewTable.putItem(item);
        return item;
    }

    public List<InterviewItem> findInterviews(String applicationId) {
        QueryConditional condition = QueryConditional.sortBeginsWith(
                Key.builder().partitionValue("APPLICATION#" + applicationId).sortValue("INTERVIEW#").build());
        return interviewTable.query(condition).items().stream().collect(Collectors.toList());
    }

    // --- StatusChange sub-items (append-only: no update/delete) ---

    public StatusChangeItem saveStatusChange(StatusChangeItem item) {
        statusChangeTable.putItem(item);
        return item;
    }

    public List<StatusChangeItem> findStatusHistory(String applicationId) {
        QueryConditional condition = QueryConditional.sortBeginsWith(
                Key.builder().partitionValue("APPLICATION#" + applicationId).sortValue("STATUSCHANGE#").build());
        return statusChangeTable.query(condition).items().stream().collect(Collectors.toList());
    }

    // --- Note sub-items ---

    public NoteItem saveNote(NoteItem item) {
        noteTable.putItem(item);
        return item;
    }

    public List<NoteItem> findNotes(String applicationId) {
        QueryConditional condition = QueryConditional.sortBeginsWith(
                Key.builder().partitionValue("APPLICATION#" + applicationId).sortValue("NOTE#").build());
        return noteTable.query(condition).items().stream().collect(Collectors.toList());
    }
}
