import { useState, useEffect } from 'react';
import type { CourseAnalytics } from '../types';
import { instructorService } from '../services/instructorService';

interface UseCourseAnalyticsResult {
  data: CourseAnalytics | null;
  loading: boolean;
  error: string;
}

/**
 * Hook that fetches cohort analytics for a given course.
 * Re-fetches whenever courseId changes.
 */
export function useCourseAnalytics(courseId: string | null): UseCourseAnalyticsResult {
  const [data, setData] = useState<CourseAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError('');
    instructorService
      .getCourseAnalytics(courseId)
      .then(setData)
      .catch(() => setError('Failed to load analytics. Please try again.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  return { data, loading, error };
}
