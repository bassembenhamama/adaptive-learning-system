package dz.edu.univconstantine2.ntic.als.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dz.edu.univconstantine2.ntic.als.dto.DtoMapper;
import dz.edu.univconstantine2.ntic.als.dto.QuestionCreateRequestDTO;
import dz.edu.univconstantine2.ntic.als.dto.QuestionDTO;
import dz.edu.univconstantine2.ntic.als.model.Module;
import dz.edu.univconstantine2.ntic.als.model.Question;
import dz.edu.univconstantine2.ntic.als.repository.ModuleRepository;
import dz.edu.univconstantine2.ntic.als.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ModuleRepository moduleRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<QuestionDTO> getQuestionsForModule(String moduleId) {
        return questionRepository.findAllByModuleIdOrderByCreatedAtDesc(moduleId)
                .stream()
                .map(DtoMapper::toQuestionDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public QuestionDTO createQuestion(String moduleId, QuestionCreateRequestDTO request) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));

        Question question = Question.builder()
                .module(module)
                .statement(request.getStatement())
                .optionsJson(serializeOptions(request.getOptions()))
                .correctAnswer(request.getCorrectAnswer())
                .difficultyLevel(request.getDifficultyLevel())
                .category(request.getCategory())
                .build();

        return DtoMapper.toQuestionDTO(questionRepository.save(question));
    }

    @Transactional
    public QuestionDTO updateQuestion(String id, QuestionCreateRequestDTO request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        question.setStatement(request.getStatement());
        question.setOptionsJson(serializeOptions(request.getOptions()));
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setDifficultyLevel(request.getDifficultyLevel());
        question.setCategory(request.getCategory());

        return DtoMapper.toQuestionDTO(questionRepository.save(question));
    }

    @Transactional
    public void deleteQuestion(String id) {
        questionRepository.deleteById(id);
    }

    @Transactional
    public void recordAnswer(String questionId, boolean isCorrect) {
        questionRepository.incrementStats(questionId, isCorrect ? 1 : 0);
    }

    private String serializeOptions(List<String> options) {
        try {
            return objectMapper.writeValueAsString(options);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize options", e);
        }
    }
}
