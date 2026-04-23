package dz.edu.univconstantine2.ntic.als.dto;

public record CourseCreateRequestDTO(
    String title,
    String category,
    String description,
    String gradient
) {}
