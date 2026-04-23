package dz.edu.univconstantine2.ntic.als.service;

import dz.edu.univconstantine2.ntic.als.dto.CourseCreateRequestDTO;
import dz.edu.univconstantine2.ntic.als.dto.CourseResponseDTO;
import dz.edu.univconstantine2.ntic.als.dto.CourseUpdateRequestDTO;
import dz.edu.univconstantine2.ntic.als.dto.DtoMapper;
import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.User;
import dz.edu.univconstantine2.ntic.als.repository.CourseRepository;
import dz.edu.univconstantine2.ntic.als.repository.EnrollmentRepository;
import dz.edu.univconstantine2.ntic.als.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getAllCourses() {
        return courseRepository.findAllActive().stream()
                .map(DtoMapper::toCourseDTO).toList();
    }

    @Transactional(readOnly = true)
    public CourseResponseDTO getCourseById(String id) {
        return courseRepository.findByIdWithModulesAndInstructor(id)
                .map(DtoMapper::toCourseDTO)
                .orElseThrow(() -> new NoSuchElementException("Course not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getCoursesByInstructor(String instructorEmail) {
        User instructor = userRepository.findByEmail(instructorEmail).orElseThrow();
        return courseRepository.findByInstructorWithModules(instructor).stream()
                .map(DtoMapper::toCourseDTO).toList();
    }

    @Transactional(rollbackFor = Exception.class)
    public CourseResponseDTO createCourse(CourseCreateRequestDTO dto, String instructorEmail) {
        User instructor = userRepository.findByEmail(instructorEmail).orElseThrow();
        Course course = Course.builder()
                .title(dto.title()).category(dto.category())
                .description(dto.description()).gradient(dto.gradient())
                .instructor(instructor).build();
        return DtoMapper.toCourseDTO(courseRepository.save(course));
    }

    @Transactional(rollbackFor = Exception.class)
    public CourseResponseDTO updateCourse(String id, CourseUpdateRequestDTO dto) {
        Course course = courseRepository.findById(id).orElseThrow();
        if (dto.title() != null) course.setTitle(dto.title());
        if (dto.description() != null) course.setDescription(dto.description());
        if (dto.category() != null) course.setCategory(dto.category());
        if (dto.gradient() != null) course.setGradient(dto.gradient());
        return DtoMapper.toCourseDTO(courseRepository.save(course));
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCourse(String id) {
        // Validate existence before proceeding
        if (!courseRepository.existsById(id)) {
            throw new NoSuchElementException("Course not found: " + id);
        }

        // Soft-delete enrollments via native SQL (bypasses Hibernate cascade)
        enrollmentRepository.softDeleteByCourseId(id);

        // Re-fetch the course after the persistence context was cleared by the native query
        Course freshCourse = courseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Course not found: " + id));
        
        // Detach enrollments so Hibernate won't cascade to them
        if (freshCourse.getEnrollments() != null) {
            freshCourse.getEnrollments().clear();
        }

        // Soft-delete course — cascades to modules via CascadeType.ALL + @SQLDelete
        courseRepository.delete(freshCourse);
        
        log.info("Course and associated enrollments soft-deleted: {}", id);
    }
}
