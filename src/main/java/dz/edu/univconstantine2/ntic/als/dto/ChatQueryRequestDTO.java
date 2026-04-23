package dz.edu.univconstantine2.ntic.als.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatQueryRequestDTO(
        @NotBlank(message = "moduleId is required")
        String moduleId,
        @NotBlank(message = "enrollmentId is required")
        String enrollmentId,
        @NotBlank(message = "query must not be blank")
        String query
) {
}
