package dz.edu.univconstantine2.ntic.als.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentIndexingService {

    private static final Logger log = LoggerFactory.getLogger(DocumentIndexingService.class);

    private final DocumentTextExtractor textExtractor;
    private final EmbeddingService embeddingService;
    private final QdrantService qdrantService;

    @Async
    public void indexModuleDocument(String moduleId, String courseId, String filePath) {
        log.info("Starting async indexing for moduleId: {}, courseId: {}, file: {}", moduleId, courseId, filePath);
        
        try {
            // 1. Extract text and chunk
            List<String> chunks = textExtractor.extractAndChunk(Path.of(filePath));
            if (chunks.isEmpty()) {
                log.warn("No chunks extracted for module {}. Indexing aborted.", moduleId);
                return;
            }
            log.info("Extracted {} chunks for module {}", chunks.size(), moduleId);

            // 2. Generate embeddings
            log.info("Generating embeddings for {} chunks...", chunks.size());
            List<List<Float>> embeddings = embeddingService.embedBatch(chunks);
            log.info("Generated embeddings successfully.");

            // 3. Upsert to Qdrant
            log.info("Upserting to Qdrant...");
            qdrantService.upsertDocumentChunks(moduleId, courseId, chunks, embeddings);
            log.info("Finished indexing for module {}", moduleId);

        } catch (Exception e) {
            log.error("Failed to index document for module {}: {}", moduleId, e.getMessage());
        }
    }

    public void reindexModule(String moduleId, String courseId, String filePath) {
        log.info("Re-indexing module {}. Deleting old vectors first.", moduleId);
        qdrantService.deleteModuleVectors(moduleId);
        indexModuleDocument(moduleId, courseId, filePath);
    }
}
