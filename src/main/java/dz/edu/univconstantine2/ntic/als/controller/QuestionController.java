package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.QuestionCreateRequestDTO;
import dz.edu.univconstantine2.ntic.als.dto.QuestionDTO;
import dz.edu.univconstantine2.ntic.als.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/module/{moduleId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<QuestionDTO>> getQuestionsForModule(@PathVariable String moduleId) {
        return ResponseEntity.ok(questionService.getQuestionsForModule(moduleId));
    }

    @PostMapping("/module/{moduleId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<QuestionDTO> createQuestion(@PathVariable String moduleId,
                                                     @Valid @RequestBody QuestionCreateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(questionService.createQuestion(moduleId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<QuestionDTO> updateQuestion(@PathVariable String id,
                                                     @Valid @RequestBody QuestionCreateRequestDTO request) {
        return ResponseEntity.ok(questionService.updateQuestion(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}
