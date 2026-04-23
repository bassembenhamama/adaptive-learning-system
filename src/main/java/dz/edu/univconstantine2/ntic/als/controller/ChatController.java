package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.ChatHistoryDTO;
import dz.edu.univconstantine2.ntic.als.dto.ChatQueryRequestDTO;
import dz.edu.univconstantine2.ntic.als.dto.ChatResponseDTO;
import dz.edu.univconstantine2.ntic.als.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final ChatService chatService;

    @PostMapping("/query")
    @PreAuthorize("hasRole('LEARNER')")
    public ResponseEntity<ChatResponseDTO> processQuery(@Valid @RequestBody ChatQueryRequestDTO request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Received chat query from user: {}", userEmail);
        return ResponseEntity.ok(chatService.processQuery(request, userEmail));
    }

    @GetMapping("/history/{moduleId}/{enrollmentId}")
    @PreAuthorize("hasRole('LEARNER')")
    public ResponseEntity<List<ChatHistoryDTO>> getChatHistory(
            @PathVariable String moduleId,
            @PathVariable String enrollmentId) {
        log.info("Received request for chat history: moduleId={}, enrollmentId={}", moduleId, enrollmentId);
        return ResponseEntity.ok(chatService.getChatHistory(moduleId, enrollmentId));
    }
}
