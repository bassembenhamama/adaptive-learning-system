package dz.edu.univconstantine2.ntic.als.event;

import dz.edu.univconstantine2.ntic.als.service.DocumentIndexingService;
import dz.edu.univconstantine2.ntic.als.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.nio.file.Path;

@Component
@RequiredArgsConstructor
public class FileIndexingListener {

    private static final Logger log = LoggerFactory.getLogger(FileIndexingListener.class);

    private final DocumentIndexingService indexingService;
    private final FileStorageService fileStorageService;

    @Async
    @EventListener
    public void onFileIndexingRequest(FileIndexingRequestEvent event) {
        log.info("Received FileIndexingRequestEvent for module: {}", event.moduleId());
        
        try {
            Path fullPath = fileStorageService.load(event.filePath());
            indexingService.indexModuleDocument(
                    event.moduleId(), 
                    event.courseId(), 
                    fullPath.toString()
            );
        } catch (Exception e) {
            log.error("Error processing file indexing event: {}", e.getMessage());
        }
    }
}
