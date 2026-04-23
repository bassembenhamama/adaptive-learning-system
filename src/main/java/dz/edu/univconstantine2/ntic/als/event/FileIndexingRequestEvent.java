package dz.edu.univconstantine2.ntic.als.event;

public record FileIndexingRequestEvent(
        String moduleId,
        String courseId,
        String filePath
) {
}
