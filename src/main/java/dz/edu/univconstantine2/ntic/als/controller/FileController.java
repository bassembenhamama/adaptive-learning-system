package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.ErrorResponse;
import dz.edu.univconstantine2.ntic.als.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-msvideo",
            "video/x-matroska"
    );

    private final FileStorageService fileStorageService;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public FileController(FileStorageService fileStorageService, org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.fileStorageService = fileStorageService;
        this.eventPublisher = eventPublisher;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "moduleId", required = false) String moduleId,
            @RequestParam(value = "courseId", required = false) String courseId) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(400, "No file provided."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(400, "Unsupported file type. Allowed: PDF, MP4, WebM, MOV, AVI, MKV."));
        }

        try {
            String filename = fileStorageService.store(file);
            String fileUrl = "/api/files/" + filename;

            // Trigger indexing if moduleId and courseId are provided (Task 10-H)
            if (moduleId != null && courseId != null && contentType.equals("application/pdf")) {
                log.info("Publishing FileIndexingRequestEvent for module: {}", moduleId);
                eventPublisher.publishEvent(new dz.edu.univconstantine2.ntic.als.event.FileIndexingRequestEvent(moduleId, courseId, filename));
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("filename", filename, "url", fileUrl));
        } catch (IOException e) {
            log.error("File upload failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Failed to store file."));
        }
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        Resource resource = fileStorageService.loadAsResource(filename);
        String contentType = determineContentType(filename);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    private String determineContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".mp4")) return "video/mp4";
        if (lower.endsWith(".webm")) return "video/webm";
        if (lower.endsWith(".mov")) return "video/quicktime";
        if (lower.endsWith(".avi")) return "video/x-msvideo";
        if (lower.endsWith(".mkv")) return "video/x-matroska";
        return "application/octet-stream";
    }
}
