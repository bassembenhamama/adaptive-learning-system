package dz.edu.univconstantine2.ntic.als.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dz.edu.univconstantine2.ntic.als.model.DifficultyLevel;
import dz.edu.univconstantine2.ntic.als.model.Module;
import dz.edu.univconstantine2.ntic.als.model.Question;
import dz.edu.univconstantine2.ntic.als.repository.ModuleRepository;
import dz.edu.univconstantine2.ntic.als.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
public class QuestionMigrationService implements CommandLineRunner {

    private final ModuleRepository moduleRepository;
    private final QuestionRepository questionRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting Question Bank migration...");

        List<Module> quizModules = moduleRepository.findAll()
                .stream()
                .filter(m -> "quiz".equals(m.getType()))
                .filter(m -> StringUtils.hasText(m.getQuestionsJson()))
                .toList();

        int totalMigrated = 0;

        for (Module module : quizModules) {
            long existingCount = questionRepository.countByModuleId(module.getId());
            if (existingCount > 0) {
                log.info("Module {} ({}) already has {} questions. Skipping migration.", 
                        module.getTitle(), module.getId(), existingCount);
                continue;
            }

            try {
                String json = module.getQuestionsJson();
                if (json == null || json.equals("null") || json.trim().isEmpty()) {
                    continue;
                }

                List<Map<String, Object>> legacyQuestions = objectMapper.readValue(
                        json, 
                        new TypeReference<List<Map<String, Object>>>() {}
                );
                
                if (legacyQuestions == null) continue;

                for (Map<String, Object> qMap : legacyQuestions) {
                    if (qMap == null || !qMap.containsKey("question")) continue;

                    String statement = (String) qMap.get("question");
                    Object optionsObj = qMap.get("options");
                    Object correctObj = qMap.get("correct");

                    if (!StringUtils.hasText(statement)) continue;

                    Integer correct = 0;
                    if (correctObj instanceof Number num) {
                        correct = num.intValue();
                    } else if (correctObj instanceof String str) {
                        try { correct = Integer.parseInt(str); } catch (NumberFormatException ignored) {}
                    }

                    Question question = Question.builder()
                            .module(module)
                            .statement(statement)
                            .optionsJson(objectMapper.writeValueAsString(optionsObj != null ? optionsObj : List.of()))
                            .correctAnswer(correct)
                            .difficultyLevel(DifficultyLevel.MEDIUM)
                            .build();
                    questionRepository.save(question);
                    totalMigrated++;
                }
                log.info("Migrated questions for module: {}", module.getTitle());
            } catch (Exception e) {
                log.error("Failed to migrate questions for module {}: {}", module.getTitle(), e.getMessage());
            }
        }

        log.info("Question Bank migration completed. Total questions migrated: {}", totalMigrated);
    }
}
