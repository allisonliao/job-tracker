package com.allisonliao.job_tracker_backend.integration;

import java.net.URI;

import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.utility.DockerImageName;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import com.allisonliao.job_tracker_backend.config.TableBootstrapper;

@SpringBootTest
@AutoConfigureMockMvc
public abstract class MiniStackTestBase {

    // Singleton container pattern: started once via this static initializer (the JVM
    // only runs it the first time this class is loaded, no matter how many test classes
    // extend it) and deliberately never stopped by us — Testcontainers' Ryuk reaper cleans
    // it up at JVM exit. NOT using @Container/@Testcontainers here: that combination binds
    // stop() to each individual test class's lifecycle, which would tear this shared
    // container down after the first test class finishes and break every test class after it.
    static final GenericContainer<?> ministack = new GenericContainer<>(DockerImageName.parse("ministackorg/ministack:latest"))
            .withExposedPorts(4566)
            .waitingFor(Wait.forHttp("/_ministack/health").forStatusCode(200));

    static {
        ministack.start();
        DynamoDbClient client = DynamoDbClient.builder()
                .region(Region.US_EAST_1)
                .endpointOverride(URI.create("http://" + ministack.getHost() + ":" + ministack.getMappedPort(4566)))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
                .build();
        TableBootstrapper.createTableIfNotExists(client, "JobTracker");
    }

    @DynamicPropertySource
    static void awsProperties(DynamicPropertyRegistry registry) {
        registry.add("app.aws.dynamo-db-endpoint",
                () -> "http://" + ministack.getHost() + ":" + ministack.getMappedPort(4566));
        registry.add("app.aws.region", () -> "us-east-1");
        registry.add("app.aws.table-name", () -> "JobTracker");
    }
}
