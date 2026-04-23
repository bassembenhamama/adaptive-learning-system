package dz.edu.univconstantine2.ntic.als.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Profile("prod")
@Slf4j
public class EnvironmentValidator implements ApplicationListener<ApplicationReadyEvent> {
    @Value("${spring.datasource.url}") private String dbUrl;
    @Value("${app.jwt.secret}") private String jwtSecret;
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        List<String> missing = new ArrayList<>();
        if (dbUrl == null || dbUrl.isBlank()) missing.add("DB_URL");
        if (jwtSecret == null || jwtSecret.length() < 32) missing.add("JWT_SECRET (must be 32+ chars)");
        if (!missing.isEmpty()) {
            log.error("FATAL: Missing required environment variables: {}", missing);
            log.error("Application cannot start safely. Shutting down.");
            System.exit(1);
        }
        log.info("Environment validation passed. All required variables are set.");
    }
}
