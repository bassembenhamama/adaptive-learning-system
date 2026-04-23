package dz.edu.univconstantine2.ntic.als.service;

import dz.edu.univconstantine2.ntic.als.dto.DtoMapper;
import dz.edu.univconstantine2.ntic.als.dto.ModuleCreateRequestDTO;
import dz.edu.univconstantine2.ntic.als.dto.ModuleResponseDTO;
import dz.edu.univconstantine2.ntic.als.dto.ModuleUpdateRequestDTO;
import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.Module;
import dz.edu.univconstantine2.ntic.als.repository.CourseRepository;
import dz.edu.univconstantine2.ntic.als.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModuleService {
    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public List<ModuleResponseDTO> getModulesByCourse(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NoSuchElementException("Course not found: " + courseId));
        return moduleRepository.findByCourseOrderByDisplayOrderAsc(course).stream()
                .map(DtoMapper::toModuleDTO).toList();
    }

    @Transactional(readOnly = true)
    public ModuleResponseDTO getModuleById(String id) {
        return moduleRepository.findById(id)
                .map(DtoMapper::toModuleDTO)
                .orElseThrow(() -> new NoSuchElementException("Module not found: " + id));
    }

    @Transactional(rollbackFor = Exception.class)
    public ModuleResponseDTO createModule(String courseId, ModuleCreateRequestDTO dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NoSuchElementException("Course not found: " + courseId));
        
        Module module = Module.builder()
                .title(dto.title())
                .type(dto.type())
                .displayOrder(dto.displayOrder())
                .contentUrl(dto.contentUrl())
                .threshold(dto.threshold())
                .questionsJson(dto.questionsJson())
                .course(course)
                .build();
        
        return DtoMapper.toModuleDTO(moduleRepository.save(module));
    }

    @Transactional(rollbackFor = Exception.class)
    public ModuleResponseDTO updateModule(String id, ModuleUpdateRequestDTO dto) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Module not found: " + id));
        
        if (dto.title() != null) module.setTitle(dto.title());
        if (dto.type() != null) module.setType(dto.type());
        if (dto.displayOrder() != null) module.setDisplayOrder(dto.displayOrder());
        if (dto.contentUrl() != null) module.setContentUrl(dto.contentUrl());
        if (dto.threshold() != null) module.setThreshold(dto.threshold());
        if (dto.questionsJson() != null) module.setQuestionsJson(dto.questionsJson());
        
        return DtoMapper.toModuleDTO(moduleRepository.save(module));
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteModule(String id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Module not found: " + id));
        moduleRepository.delete(module);
        log.info("Module soft-deleted: {}", id);
    }
}
