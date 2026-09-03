package com.allisonliao.job_tracker_backend.integration;

import java.net.URI;

import org.junit.jupiter.api.BeforeAll;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import com.allisonliao.job_tracker_backend.config.TableBootstrapper;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class MiniStackTestBase {

    @Container
    static final GenericContainer<?> ministack = new GenericContainer<>(DockerImageName.parse("ministackorg/ministack:latest"))
            .withExposedPorts(4566)
            .waitingFor(Wait.forHttp("/_ministack/health").forStatusCode(200));

    @DynamicPropertySource
    static void awsProperties(DynamicPropertyRegistry registry) {
        registry.add("app.aws.dynamo-db-endpoint",
                () -> "http://" + ministack.getHost() + ":" + ministack.getMappedPort(4566));
        registry.add("app.aws.region", () -> "us-east-1");
        registry.add("app.aws.table-name", () -> "JobTracker");
    }

    @BeforeAll
    static void createTable() {
        DynamoDbClient client = DynamoDbClient.builder()
                .region(Region.US_EAST_1)
                .endpointOverride(URI.create("http://" + ministack.getHost() + ":" + ministack.getMappedPort(4566)))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
                .build();
        TableBootstrapper.createTableIfNotExists(client, "JobTracker");
    }
}
