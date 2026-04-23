package dz.edu.univconstantine2.ntic.als.dto;

import java.util.List;

/**
 * Cohort-level analytics for a single course, returned by
 * GET /api/instructor/courses/{courseId}/analytics.
 */
public record CourseAnalyticsDTO(
        String courseId,
        String courseTitle,
        long totalEnrollments,
        double overallAverageScore,
        List<ModuleAnalyticsDTO> modules
) {}
