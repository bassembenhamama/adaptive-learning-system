package dz.edu.univconstantine2.ntic.als.config;

import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.Module;
import dz.edu.univconstantine2.ntic.als.model.User;
import dz.edu.univconstantine2.ntic.als.repository.CourseRepository;
import dz.edu.univconstantine2.ntic.als.repository.ModuleRepository;
import dz.edu.univconstantine2.ntic.als.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
                                      CourseRepository courseRepository,
                                      ModuleRepository moduleRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmail("admin@als.edu").isEmpty()) {
                User admin = new User();
                admin.setName("System Administrator");
                admin.setEmail("admin@als.edu");
                admin.setPassword(passwordEncoder.encode("password123"));
                admin.setRole("ADMIN");
                admin.setInitials("SA");
                userRepository.save(admin);
            }

            if (userRepository.findByEmail("meriem.belguidoum@univ-constantine2.dz").isEmpty()) {
                User instructor = new User();
                instructor.setName("Prof. Meriem Belguidoum");
                instructor.setEmail("meriem.belguidoum@univ-constantine2.dz");
                instructor.setPassword(passwordEncoder.encode("password123"));
                instructor.setRole("INSTRUCTOR");
                instructor.setInitials("MB");
                userRepository.save(instructor);

                Course c1 = new Course();
                c1.setTitle("Software Architecture Fundamentals");
                c1.setCategory("Software Engineering");
                c1.setDescription("Master the principles of clean architecture, design patterns, and modular software systems.");
                c1.setGradient("from-emerald-600 to-teal-700");
                c1.setInstructor(instructor);
                courseRepository.save(c1);

                Module m1 = new Module();
                m1.setTitle("Introduction to Architecture");
                m1.setType("text");
                m1.setOrder(1);
                m1.setCourse(c1);
                m1.setContentUrl("Architecture is the fundamental organization of a system embodied in its components, their relationships to each other and the environment, and the principles governing its design and evolution.");
                moduleRepository.save(m1);

                Module m2 = new Module();
                m2.setTitle("Design Patterns Overview");
                m2.setType("text");
                m2.setOrder(2);
                m2.setCourse(c1);
                m2.setContentUrl("Design patterns are reusable solutions to commonly occurring problems in software design. They represent best practices that experienced developers have refined over time.");
                moduleRepository.save(m2);

                Module m3 = new Module();
                m3.setTitle("Architecture Assessment");
                m3.setType("quiz");
                m3.setOrder(3);
                m3.setCourse(c1);
                m3.setThreshold(50);
                m3.setQuestionsJson("[{\"question\":\"What is the primary goal of software architecture?\",\"options\":[\"Performance\",\"Maintainability and modularity\",\"Visual design\",\"Database speed\"],\"correct\":1},{\"question\":\"Which pattern separates data, logic, and presentation?\",\"options\":[\"Singleton\",\"Observer\",\"MVC\",\"Factory\"],\"correct\":2}]");
                moduleRepository.save(m3);

                Course c2 = new Course();
                c2.setTitle("UML Modeling & System Design");
                c2.setCategory("Software Engineering");
                c2.setDescription("Learn to model complex systems using UML diagrams including use case, class, and sequence diagrams.");
                c2.setGradient("from-blue-600 to-indigo-700");
                c2.setInstructor(instructor);
                courseRepository.save(c2);

                Course c3 = new Course();
                c3.setTitle("Agile Development Practices");
                c3.setCategory("Project Management");
                c3.setDescription("Explore Scrum, Kanban, and modern agile methodologies for effective software delivery.");
                c3.setGradient("from-violet-600 to-purple-700");
                c3.setInstructor(instructor);
                courseRepository.save(c3);
            }

            if (userRepository.findByEmail("bassem.benhamama@univ-constantine2.dz").isEmpty()) {
                User learner = new User();
                learner.setName("Bassem Imrane Ben Hamama");
                learner.setEmail("bassem.benhamama@univ-constantine2.dz");
                learner.setPassword(passwordEncoder.encode("password123"));
                learner.setRole("LEARNER");
                learner.setInitials("BB");
                userRepository.save(learner);
            }

            if (userRepository.findByEmail("mamadou.diallo@univ-constantine2.dz").isEmpty()) {
                User learner2 = new User();
                learner2.setName("Mamadou Mouctar Diallo");
                learner2.setEmail("mamadou.diallo@univ-constantine2.dz");
                learner2.setPassword(passwordEncoder.encode("password123"));
                learner2.setRole("LEARNER");
                learner2.setInitials("MD");
                userRepository.save(learner2);
            }
        };
    }
}
