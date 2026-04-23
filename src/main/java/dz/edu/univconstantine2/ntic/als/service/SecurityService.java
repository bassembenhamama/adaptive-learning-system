package dz.edu.univconstantine2.ntic.als.service;

import dz.edu.univconstantine2.ntic.als.repository.CourseRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final CourseRepository courseRepository;

    public boolean isCourseInstructor(String courseId, String email) {
        return courseRepository.findById(courseId)
                .map(c -> c.getInstructor() != null &&
                        c.getInstructor().getEmail().equals(email))
                .orElse(false);
    }
}
