package dz.edu.univconstantine2.ntic.als.dto;

public record ModuleCreateRequestDTO(
    String title,
    String type,
    Integer displayOrder,
    String contentUrl,
    Integer threshold,
    String questionsJson
) {}
