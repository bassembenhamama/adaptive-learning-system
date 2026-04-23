package dz.edu.univconstantine2.ntic.als.dto;

public record CourseUpdateRequestDTO(
    String title,
    String category,
    String description,
    String gradient
) {}
