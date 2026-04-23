package dz.edu.univconstantine2.ntic.als;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAwareImpl")
@EnableAsync
public class AdaptiveLearningSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(AdaptiveLearningSystemApplication.class, args);
	}

}
