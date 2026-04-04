package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.ErrorResponse;
import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.Module;
import dz.edu.univconstantine2.ntic.als.repository.CourseRepository;
import dz.edu.univconstantine2.ntic.als.repository.ModuleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
public class ModuleController {

    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;

    public ModuleController(ModuleRepository moduleRepository, CourseRepository courseRepository) {
        this.moduleRepository = moduleRepository;
        this.courseRepository = courseRepository;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getModulesByCourse(@PathVariable String courseId) {
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Course not found."));
        }
        List<Module> modules = moduleRepository.findByCourseOrderByDisplayOrderAsc(course);
        return ResponseEntity.ok(modules);
    }

    @PostMapping("/{courseId}")
    public ResponseEntity<?> createModule(@PathVariable String courseId, @RequestBody Module module) {
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Course not found."));
        }
        module.setCourse(course);
        return ResponseEntity.status(HttpStatus.CREATED).body(moduleRepository.save(module));
    }

    @PutMapping("/{moduleId}")
    public ResponseEntity<?> updateModule(@PathVariable String moduleId, @RequestBody Module moduleData) {
        Module module = moduleRepository.findById(moduleId).orElse(null);
        if (module == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Module not found."));
        }
        if (moduleData.getTitle() != null) module.setTitle(moduleData.getTitle());
        if (moduleData.getType() != null) module.setType(moduleData.getType());
        if (moduleData.getOrder() != null) module.setOrder(moduleData.getOrder());
        if (moduleData.getContentUrl() != null) module.setContentUrl(moduleData.getContentUrl());
        if (moduleData.getThreshold() != null) module.setThreshold(moduleData.getThreshold());
        if (moduleData.getQuestionsJson() != null) module.setQuestionsJson(moduleData.getQuestionsJson());
        return ResponseEntity.ok(moduleRepository.save(module));
    }

    @PutMapping("/{moduleId}/resource")
    public ResponseEntity<?> setResource(@PathVariable String moduleId, @RequestBody Module resourceData) {
        Module module = moduleRepository.findById(moduleId).orElse(null);
        if (module == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Module not found."));
        }
        module.setContentUrl(resourceData.getContentUrl());
        return ResponseEntity.ok(moduleRepository.save(module));
    }

    @PutMapping("/{moduleId}/quiz")
    public ResponseEntity<?> setQuiz(@PathVariable String moduleId, @RequestBody Module quizData) {
        Module module = moduleRepository.findById(moduleId).orElse(null);
        if (module == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Module not found."));
        }
        module.setThreshold(quizData.getThreshold());
        module.setQuestionsJson(quizData.getQuestionsJson());
        return ResponseEntity.ok(moduleRepository.save(module));
    }

    @DeleteMapping("/{moduleId}")
    public ResponseEntity<?> deleteModule(@PathVariable String moduleId) {
        if (!moduleRepository.existsById(moduleId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Module not found."));
        }
        moduleRepository.deleteById(moduleId);
        return ResponseEntity.noContent().build();
    }
}
