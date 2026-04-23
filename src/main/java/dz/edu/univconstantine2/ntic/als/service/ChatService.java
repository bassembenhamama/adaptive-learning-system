package dz.edu.univconstantine2.ntic.als.service;

import dz.edu.univconstantine2.ntic.als.dto.ChatHistoryDTO;
import dz.edu.univconstantine2.ntic.als.dto.ChatQueryRequestDTO;
import dz.edu.univconstantine2.ntic.als.dto.ChatResponseDTO;
import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.Message;
import dz.edu.univconstantine2.ntic.als.model.Module;
import dz.edu.univconstantine2.ntic.als.repository.MessageRepository;
import dz.edu.univconstantine2.ntic.als.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final RAGService ragService;
    private final LLMService llmService;
    private final MessageRepository messageRepository;
    private final ModuleRepository moduleRepository;

    @Transactional
    public ChatResponseDTO processQuery(ChatQueryRequestDTO request, String userEmail) {
        long startTime = System.currentTimeMillis();
        
        log.info("Processing query for module: {} from user: {}", request.moduleId(), userEmail);

        Module module = moduleRepository.findById(request.moduleId())
                .orElseThrow(() -> new NoSuchElementException("Module not found: " + request.moduleId()));
        
        Course course = module.getCourse();
        String courseName = (course != null) ? course.getTitle() : "Unknown Course";

        // 1. Context Retrieval (RAG)
        RAGResult ragResult = ragService.retrieveContext(request.query(), request.moduleId());

        // 2. LLM Response Generation
        String aiResponse = llmService.generateResponse(
                request.query(),
                courseName,
                module.getTitle(),
                ragResult.contextChunks()
        );

        long processingTimeMs = System.currentTimeMillis() - startTime;

        // 3. Save Message Entity
        Message message = Message.builder()
                .moduleId(request.moduleId())
                .enrollmentId(request.enrollmentId())
                .userQuery(request.query())
                .aiResponse(aiResponse)
                .wasOutOfContext(ragResult.isOutOfContext())
                .retrievedChunkCount(ragResult.contextChunks().size())
                .processingTimeMs(processingTimeMs)
                .build();

        messageRepository.save(message);

        return new ChatResponseDTO(
                aiResponse,
                ragResult.isOutOfContext(),
                ragResult.contextChunks().size(),
                processingTimeMs
        );
    }

    @Transactional(readOnly = true)
    public List<ChatHistoryDTO> getChatHistory(String moduleId, String enrollmentId) {
        log.info("Retrieving chat history for moduleId: {}, enrollmentId: {}", moduleId, enrollmentId);
        
        return messageRepository.findByModuleIdAndEnrollmentIdOrderByCreatedAtAsc(moduleId, enrollmentId)
                .stream()
                .map(m -> new ChatHistoryDTO(
                        m.getUserQuery(),
                        m.getAiResponse(),
                        m.isWasOutOfContext(),
                        m.getCreatedAt()
                ))
                .toList();
    }
}
