package dz.edu.univconstantine2.ntic.als.dto;

/**
 * Task 4-C — AdminStatsDTO
 *
 * All five metrics are computed from repository count queries so no
 * entities are loaded into memory.
 */
public record AdminStatsDTO(
        long totalUsers,
        long totalCourses,
        long totalEnrollments,
        long masteredEnrollments,
        long totalModules
) {}
