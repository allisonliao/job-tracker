package com.allisonliao.job_tracker_backend;

import com.allisonliao.job_tracker_backend.config.AwsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AwsProperties.class)
public class JobTrackerBackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(JobTrackerBackendApplication.class, args);
	}
}
