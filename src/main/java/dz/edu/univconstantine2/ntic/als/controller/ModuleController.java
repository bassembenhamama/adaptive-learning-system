package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.ErrorResponse;
import dz.edu.univconstantine2.ntic.als.dto.ModuleCreateRequestDTO;
import dz.edu.univconstantine2.ntic.als.dto.ModuleUpdateRequestDTO;
import dz.edu.univconstantine2.ntic.als.service.ModuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@Slf4j
@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getModulesByCourse(@PathVariable String courseId) {
        try {
            return ResponseEntity.ok(moduleService.getModulesByCourse(courseId));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Course not found."));
        }
    }

    @PostMapping("/{courseId}")
    public ResponseEntity<?> createModule(@PathVariable String courseId, @RequestBody ModuleCreateRequestDTO dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(moduleService.createModule(courseId, dto));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Course not found."));
        }
    }

    @PutMapping("/{moduleId}")
    public ResponseEntity<?> updateModule(@PathVariable String moduleId, @RequestBody ModuleUpdateRequestDTO dto) {
        try {
            return ResponseEntity.ok(moduleService.updateModule(moduleId, dto));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Module not found."));
        }
    }

    @PutMapping("/{moduleId}/resource")
    public ResponseEntity<?> setResource(@PathVariable String moduleId, @RequestBody ModuleUpdateRequestDTO dto) {
        try {
            return ResponseEntity.ok(moduleService.updateModule(moduleId, dto));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Module not found."));
        }
    }

    @PutMapping("/{moduleId}/quiz")
    public ResponseEntity<?> setQuiz(@PathVariable String moduleId, @RequestBody ModuleUpdateRequestDTO dto) {
        try {
            return ResponseEntity.ok(moduleService.updateModule(moduleId, dto));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Module not found."));
        }
    }

    @DeleteMapping("/{moduleId}")
    public ResponseEntity<?> deleteModule(@PathVariable String moduleId) {
        try {
            moduleService.deleteModule(moduleId);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Module not found."));
        }
    }
}
