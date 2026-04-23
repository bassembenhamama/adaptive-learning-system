package dz.edu.univconstantine2.ntic.als.dto;

public record ModuleUpdateRequestDTO(
    String title,
    String type,
    Integer displayOrder,
    String contentUrl,
    Integer threshold,
    String questionsJson
) {}
