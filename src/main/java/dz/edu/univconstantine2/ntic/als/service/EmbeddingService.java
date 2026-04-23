package dz.edu.univconstantine2.ntic.als.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.enabled:false}")
    private boolean aiEnabled;

    @Value("${ai.gemini.api-key:}")
    private String apiKey;

    @Value("${ai.gemini.embedding-model:text-embedding-004}")
    private String modelName;

    private static final String EMBED_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/%s:embedContent?key=%s";
    private static final int VECTOR_DIMENSION = 768;

    public List<Float> embed(String text) {
        if (!aiEnabled || apiKey == null || apiKey.isBlank() || apiKey.contains("your-key-here")) {
            log.warn("AI is disabled or API key is missing. Returning zero-vector.");
            return Collections.nCopies(VECTOR_DIMENSION, 0.0f);
        }

        try {
            // Truncate to avoid exceeding token limits
            String truncatedText = text.length() > 30000 ? text.substring(0, 30000) : text;

            String url = String.format(EMBED_URL_TEMPLATE, modelName, apiKey);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Google Embedding Request Structure
            Map<String, Object> body = new HashMap<>();
            
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(Map.of("text", truncatedText)));
            
            body.put("model", "models/" + modelName);
            body.put("content", content);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null && response.containsKey("embedding")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> embeddingMap = (Map<String, Object>) response.get("embedding");
                if (embeddingMap.containsKey("values")) {
                    @SuppressWarnings("unchecked")
                    List<Double> values = (List<Double>) embeddingMap.get("values");
                    return values.stream().map(Double::floatValue).toList();
                }
            }
            
            log.error("Invalid response from Google embeddings API: {}", response);
            return Collections.nCopies(VECTOR_DIMENSION, 0.0f);

        } catch (Exception e) {
            log.error("Failed to generate embedding: {}", e.getMessage());
            return Collections.nCopies(VECTOR_DIMENSION, 0.0f);
        }
    }

    public List<List<Float>> embedBatch(List<String> texts) {
        List<List<Float>> results = new ArrayList<>();
        for (String text : texts) {
            results.add(embed(text));
            // Add a brief delay as requested (Task 10-E)
            try {
                Thread.sleep(50);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        return results;
    }
}
