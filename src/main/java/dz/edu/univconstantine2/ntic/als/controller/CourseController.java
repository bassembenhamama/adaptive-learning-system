package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.ErrorResponse;
import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.User;
import dz.edu.univconstantine2.ntic.als.repository.CourseRepository;
import dz.edu.univconstantine2.ntic.als.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseController(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable String id) {
        Course course = courseRepository.findById(id).orElse(null);
        if (course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Course not found."));
        }
        return ResponseEntity.ok(course);
    }

    @GetMapping("/instructor")
    public ResponseEntity<List<Course>> getInstructorCourses() {
        User instructor = getAuthenticatedUser();
        return ResponseEntity.ok(courseRepository.findByInstructor(instructor));
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        User instructor = getAuthenticatedUser();
        course.setInstructor(instructor);
        return ResponseEntity.status(HttpStatus.CREATED).body(courseRepository.save(course));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable String id, @RequestBody Course courseData) {
        Course course = courseRepository.findById(id).orElse(null);
        if (course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Course not found."));
        }
        if (courseData.getTitle() != null) course.setTitle(courseData.getTitle());
        if (courseData.getDescription() != null) course.setDescription(courseData.getDescription());
        if (courseData.getCategory() != null) course.setCategory(courseData.getCategory());
        if (courseData.getGradient() != null) course.setGradient(courseData.getGradient());
        return ResponseEntity.ok(courseRepository.save(course));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable String id) {
        if (!courseRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Course not found."));
        }
        courseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}
