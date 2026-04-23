package dz.edu.univconstantine2.ntic.als.service;

import org.apache.tika.Tika;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentTextExtractor {

    private static final Logger log = LoggerFactory.getLogger(DocumentTextExtractor.class);

    private final Tika tika = new Tika();

    @Value("${ai.rag.chunk-size:2000}")
    private int chunkSize;

    @Value("${ai.rag.chunk-overlap:200}")
    private int chunkOverlap;

    public List<String> extractAndChunk(Path filePath) {
        try {
            log.info("Extracting text from file: {}", filePath);
            String rawText = tika.parseToString(filePath);
            if (rawText == null || rawText.isBlank()) {
                log.warn("Extracted text is empty for file: {}", filePath);
                return List.of();
            }

            // Simple normalization: replace multiple whitespaces/newlines with single space
            String normalizedText = rawText.replaceAll("\\s+", " ").trim();
            
            return chunkText(normalizedText);

        } catch (Exception e) {
            log.error("Failed to extract text from {}: {}", filePath, e.getMessage());
            return List.of();
        }
    }

    private List<String> chunkText(String text) {
        List<String> chunks = new ArrayList<>();
        
        // Split by sentence boundaries: . ! ? followed by space
        String[] sentences = text.split("(?<=[.!?])\\s+");
        
        StringBuilder currentChunk = new StringBuilder();
        
        for (String sentence : sentences) {
            if (currentChunk.length() + sentence.length() > chunkSize && currentChunk.length() > 0) {
                // Current chunk is full, save it
                chunks.add(currentChunk.toString().trim());
                
                // Prepare next chunk with overlap
                String previousContent = currentChunk.toString();
                int overlapStart = Math.max(0, previousContent.length() - chunkOverlap);
                String overlapText = previousContent.substring(overlapStart);
                
                currentChunk = new StringBuilder(overlapText);
            }
            
            if (currentChunk.length() > 0 && !currentChunk.toString().endsWith(" ")) {
                currentChunk.append(" ");
            }
            currentChunk.append(sentence);
        }
        
        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString().trim());
        }
        
        log.info("Split document into {} chunks", chunks.size());
        return chunks;
    }
}
