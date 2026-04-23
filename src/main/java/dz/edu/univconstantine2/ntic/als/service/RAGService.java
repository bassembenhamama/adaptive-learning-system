package dz.edu.univconstantine2.ntic.als.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class RAGService {

    private static final Logger log = LoggerFactory.getLogger(RAGService.class);

    private final EmbeddingService embeddingService;
    private final QdrantService qdrantService;

    @Value("${ai.rag.top-k:5}")
    private int topK;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(\\+\\d{1,3}[-.\\s]?)?(\\d{2,4}[-.\\s]?){2,4}\\d{2,4}");

    public RAGResult retrieveContext(String query, String moduleId) {
        log.info("Retrieving context for query in module: {}", moduleId);
        
        // 1. Sanitize query (PII stripping - NFR-S03)
        String sanitizedQuery = sanitize(query);
        
        // 2. Truncate to 500 characters
        if (sanitizedQuery.length() > 500) {
            sanitizedQuery = sanitizedQuery.substring(0, 500);
        }

        // 3. Embed the query
        List<Float> embedding = embeddingService.embed(sanitizedQuery);

        // 4. Find similar context in Qdrant
        List<String> contextChunks = qdrantService.findSimilarContext(embedding, moduleId, topK);

        boolean isOutOfContext = contextChunks.isEmpty();
        
        return new RAGResult(contextChunks, isOutOfContext);
    }

    private String sanitize(String input) {
        if (input == null) return "";
        
        String result = input;
        
        // Strip emails
        result = EMAIL_PATTERN.matcher(result).replaceAll("[EMAIL_REMOVED]");
        
        // Strip phone numbers
        result = PHONE_PATTERN.matcher(result).replaceAll("[PHONE_REMOVED]");
        
        return result;
    }
}
