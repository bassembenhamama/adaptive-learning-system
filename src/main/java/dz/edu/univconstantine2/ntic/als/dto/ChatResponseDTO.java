package dz.edu.univconstantine2.ntic.als.dto;

public record ChatResponseDTO(
        String response,
        boolean isOutOfContext,
        int retrievedChunkCount,
        long processingTimeMs
) {
}
