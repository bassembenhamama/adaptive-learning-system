package dz.edu.univconstantine2.ntic.als.dto;

public record ModuleResponseDTO(String id, String title, String type,
    Integer order, String contentUrl, Integer threshold, String questionsJson) {}
