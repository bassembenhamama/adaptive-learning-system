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
public class LLMService {

    private static final Logger log = LoggerFactory.getLogger(LLMService.class);

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.enabled:false}")
    private boolean aiEnabled;

    @Value("${ai.gemini.api-key:}")
    private String apiKey;

    @Value("${ai.gemini.chat-model:gemini-3-flash-preview}")
    private String modelName;

    @Value("${ai.gemini.max-tokens:1000}")
    private int maxTokens;

    @Value("${ai.gemini.temperature:0.3}")
    private float temperature;

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    public String generateResponse(String query, String courseName, String moduleTitle, List<String> contextChunks) {
        if (!aiEnabled || apiKey == null || apiKey.isBlank() || apiKey.contains("your-key-here")) {
            return "AI Tutoring is currently not configured or disabled by the administrator.";
        }

        try {
            String systemPrompt = buildSystemPrompt(courseName, moduleTitle, contextChunks);
            String url = GEMINI_BASE_URL + modelName + ":generateContent?key=" + apiKey;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Gemini Request Structure
            Map<String, Object> body = new HashMap<>();
            
            // System instructions
            Map<String, Object> systemInstruction = new HashMap<>();
            systemInstruction.put("parts", Map.of("text", systemPrompt));
            body.put("system_instruction", systemInstruction);

            // User contents
            Map<String, Object> userContent = new HashMap<>();
            userContent.put("role", "user");
            userContent.put("parts", List.of(Map.of("text", query)));
            body.put("contents", List.of(userContent));

            // Generation config
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", temperature);
            generationConfig.put("maxOutputTokens", maxTokens);
            body.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null && response.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            
            log.error("Invalid response from Gemini API: {}", response);
            return "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";

        } catch (Exception e) {
            log.error("Failed to generate AI response: {}", e.getMessage());
            return "An error occurred while generating the AI response. Please try again.";
        }
    }

    private String buildSystemPrompt(String courseName, String moduleTitle, List<String> contextChunks) {
        if (contextChunks.isEmpty()) {
            return "You are an AI Tutor for the course '" + courseName + "', specifically for the module '" + moduleTitle + "'. " +
                   "The user has asked a question for which no relevant course materials were found. " +
                   "INSTRUCTION: Politely explain that you can only answer questions related to the specific course content and that the current query seems to be out of scope.";
        }

        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a Socratic AI Tutor for the course '").append(courseName).append("'.\n");
        prompt.append("Your goal is to help the student understand the following module: '").append(moduleTitle).append("'.\n\n");
        prompt.append("COURSE MATERIALS (CONTEXT):\n");
        for (String chunk : contextChunks) {
            prompt.append("--- CHUNK ---\n").append(chunk).append("\n");
        }
        prompt.append("\nINSTRUCTIONS:\n");
        prompt.append("1. Answer the student's question ONLY using the provided course materials.\n");
        prompt.append("2. Adopt a Socratic approach: avoid giving direct answers immediately if the concept is complex. Instead, guide the student with hints or clarifying questions.\n");
        prompt.append("3. Keep your response concise (maximum 300 words).\n");
        prompt.append("4. Use Markdown for formatting.\n");
        prompt.append("5. If the question cannot be answered using the provided context, state that clearly.");

        return prompt.toString();
    }
}
