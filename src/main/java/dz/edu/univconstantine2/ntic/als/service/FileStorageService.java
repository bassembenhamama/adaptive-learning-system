package dz.edu.univconstantine2.ntic.als.service;

import jakarta.annotation.PostConstruct;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    /**
     * Task 4-E — Tika instance (thread-safe, reuse as singleton).
     * Used to detect the REAL media type from the first bytes of each upload.
     */
    private static final Tika TIKA = new Tika();

    /**
     * Task 4-E — maps each allowed extension to its expected MIME-type prefix.
     * Prefix matching covers all vendor-specific sub-types (e.g. video/mp4, video/webm).
     */
    private static final Map<String, String> ALLOWED_MIME_PREFIXES = Map.of(
            "pdf",  "application/pdf",
            "mp4",  "video/",
            "webm", "video/",
            "mov",  "video/",
            "avi",  "video/",
            "mkv",  "video/"
    );

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadPath, e);
        }
    }

    /**
     * Stores a file on disk and returns the generated unique filename.
     *
     * Validation order:
     *  1. Non-null, non-blank original name
     *  2. Path traversal rejection
     *  3. Extension whitelist
     *  4. Task 4-E: Tika byte-level MIME check (prevents .exe renamed to .pdf)
     *  5. UUID rename to discard original name
     *  6. Final path-escape check
     */
    public String store(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new SecurityException("File must have a name.");
        }

        // Reject path traversal sequences
        if (originalFilename.contains("..") || originalFilename.contains("/")
                || originalFilename.contains("\\") || originalFilename.contains("\0")) {
            throw new SecurityException("Invalid filename detected.");
        }

        // Extract and validate extension
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex + 1).toLowerCase();
        }

        List<String> allowed = List.of("pdf", "mp4", "webm", "mov", "avi", "mkv");
        if (!allowed.contains(extension)) {
            throw new SecurityException("File type not permitted: " + extension);
        }

        // Task 4-E — byte-level MIME detection with Tika
        // Tika reads only the magic bytes it needs (≤ 8 KB), then the stream is closed.
        String detectedMime;
        try (InputStream peek = file.getInputStream()) {
            detectedMime = TIKA.detect(peek);
        }
        String expectedPrefix = ALLOWED_MIME_PREFIXES.get(extension);
        if (expectedPrefix != null && !detectedMime.startsWith(expectedPrefix)) {
            log.warn("[FileStorage] MIME mismatch: declared ext={}, detected={}", extension, detectedMime);
            throw new SecurityException(
                    "File content does not match its extension (detected: " + detectedMime + ").");
        }

        // Discard original name — use UUID to prevent filename injection
        String safeFilename = UUID.randomUUID().toString() + "." + extension;
        Path target = uploadPath.resolve(safeFilename).normalize();

        // Final safety check — ensure resolved path is inside upload directory
        if (!target.startsWith(uploadPath)) {
            throw new SecurityException("Path resolution escaped upload directory.");
        }

        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        log.debug("[FileStorage] Stored {} ({}) as {}", originalFilename, detectedMime, safeFilename);
        return safeFilename;
    }

    /**
     * Resolves the full path of a stored file.
     */
    public Path load(String filename) {
        return uploadPath.resolve(filename).normalize();
    }

    /**
     * Loads a file as a Spring Resource for streaming.
     */
    public Resource loadAsResource(String filename) {
        try {
            Path filePath = uploadPath.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("File not found: " + filename);
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found: " + filename, e);
        }
    }
}
