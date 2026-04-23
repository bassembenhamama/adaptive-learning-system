package dz.edu.univconstantine2.ntic.als.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body to start a new adaptive session.
 */
public record AdaptiveStartRequestDTO(
        @NotBlank String enrollmentId,
        @NotBlank String moduleId
) {}
