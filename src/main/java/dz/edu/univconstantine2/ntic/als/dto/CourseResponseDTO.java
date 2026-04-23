package dz.edu.univconstantine2.ntic.als.dto;

import java.util.List;

public record CourseResponseDTO(String id, String title, String category,
    String description, String gradient, Long instructorId, String instructorName,
    List<ModuleResponseDTO> modules) {}
