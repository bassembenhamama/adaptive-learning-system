package dz.edu.univconstantine2.ntic.als.dto;

/**
 * Per-module analytics snapshot returned as part of CourseAnalyticsDTO.
 * averageScore and failCount are derived from enrolled learners' overall
 * score as a proxy, until per-module score tracking is added in Phase 10.
 */
public record ModuleAnalyticsDTO(
        String moduleId,
        String moduleTitle,
        long totalEnrollments,
        double averageScore,
        long failCount
) {}
