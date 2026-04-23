package dz.edu.univconstantine2.ntic.als.dto;

/**
 * Result of a module-access check (Task 8-I).
 */
public record ModuleAccessDTO(
        boolean canAccess,
        String reason
) {}
