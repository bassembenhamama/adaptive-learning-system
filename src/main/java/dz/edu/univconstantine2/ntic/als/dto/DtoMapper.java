package dz.edu.univconstantine2.ntic.als.dto;

import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.Enrollment;
import dz.edu.univconstantine2.ntic.als.model.Module;
import dz.edu.univconstantine2.ntic.als.model.Question;
import dz.edu.univconstantine2.ntic.als.model.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class DtoMapper {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private DtoMapper() {
        // Utility class — prevent instantiation
    }

    public static UserResponseDTO toUserDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getInitials(),
                user.getRole()
        );
    }

    public static ModuleResponseDTO toModuleDTO(Module module) {
        return new ModuleResponseDTO(
                module.getId(),
                module.getTitle(),
                module.getType(),
                module.getDisplayOrder(),
                module.getContentUrl(),
                module.getThreshold(),
                module.getQuestionsJson()
        );
    }

    public static CourseResponseDTO toCourseDTO(Course course) {
        List<ModuleResponseDTO> moduleDtos = Collections.emptyList();
        if (course.getModules() != null) {
            moduleDtos = course.getModules().stream()
                    .map(DtoMapper::toModuleDTO)
                    .collect(Collectors.toList());
        }

        Long instructorId = null;
        String instructorName = null;
        if (course.getInstructor() != null) {
            instructorId = course.getInstructor().getId();
            instructorName = course.getInstructor().getName();
        }

        return new CourseResponseDTO(
                course.getId(),
                course.getTitle(),
                course.getCategory(),
                course.getDescription(),
                course.getGradient(),
                instructorId,
                instructorName,
                moduleDtos
        );
    }

    public static EnrollmentResponseDTO toEnrollmentDTO(Enrollment enrollment) {
        Course course = enrollment.getCourse();
        List<ModuleResponseDTO> moduleDtos = Collections.emptyList();
        if (course != null && course.getModules() != null) {
            moduleDtos = course.getModules().stream()
                    .map(DtoMapper::toModuleDTO)
                    .collect(Collectors.toList());
        }

        return new EnrollmentResponseDTO(
                enrollment.getId(),
                course != null ? course.getId() : null,
                course != null ? course.getTitle() : null,
                course != null ? course.getCategory() : null,
                course != null ? course.getGradient() : null,
                moduleDtos,
                enrollment.getCompletedModuleIds(),
                enrollment.getScore(),
                enrollment.getMasteryState().name()
        );
    }

    public static QuestionDTO toQuestionDTO(Question question) {
        List<String> options = Collections.emptyList();
        try {
            if (question.getOptionsJson() != null) {
                options = objectMapper.readValue(question.getOptionsJson(), new TypeReference<List<String>>() {});
            }
        } catch (JsonProcessingException e) {
            // Handle parsing error — returning empty list for safety
        }

        return QuestionDTO.builder()
                .id(question.getId())
                .moduleId(question.getModule() != null ? question.getModule().getId() : null)
                .statement(question.getStatement())
                .options(options)
                .correctAnswer(question.getCorrectAnswer())
                .difficultyLevel(question.getDifficultyLevel())
                .category(question.getCategory())
                .timesAnswered(question.getTimesAnswered())
                .timesCorrect(question.getTimesCorrect())
                .successRate(question.getSuccessRate())
                .discriminationIndex(question.getDiscriminationIndex())
                .build();
    }
}
