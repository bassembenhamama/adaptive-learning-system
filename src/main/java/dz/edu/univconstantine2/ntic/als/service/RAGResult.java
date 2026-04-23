package dz.edu.univconstantine2.ntic.als.service;

import java.util.List;

public record RAGResult(
        List<String> contextChunks,
        boolean isOutOfContext
) {
}
