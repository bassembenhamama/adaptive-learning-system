package dz.edu.univconstantine2.ntic.als.service;

import io.qdrant.client.QdrantClient;
import io.qdrant.client.QdrantGrpcClient;
import io.qdrant.client.grpc.Collections.Distance;
import io.qdrant.client.grpc.Collections.VectorParams;

import io.qdrant.client.grpc.Points.*;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

import static io.qdrant.client.ValueFactory.value;

@Service
public class QdrantService {

    private static final Logger log = LoggerFactory.getLogger(QdrantService.class);

    @Value("${ai.qdrant.host:localhost}")
    private String host;

    @Value("${ai.qdrant.port:6334}")
    private int port;

    @Value("${ai.qdrant.collection:als_documents}")
    private String collectionName;

    private QdrantClient client;
    private boolean initialized = false;

    @PostConstruct
    public void init() {
        try {
            log.info("Connecting to Qdrant at {}:{}", host, port);
            client = new QdrantClient(QdrantGrpcClient.newBuilder(host, port, false).build());
            
            // Check if collection exists, if not create it
            if (!collectionExists()) {
                createCollection(768);
            } else {
                // Validate dimension (OpenAI was 1536, Google is 768)
                validateAndFixCollection();
            }
            initialized = true;
            log.info("Qdrant service initialized successfully.");
        } catch (Exception e) {
            log.warn("Failed to initialize Qdrant service: {}. Graceful degradation active.", e.getMessage());
            client = null;
        }
    }

    private void createCollection(int size) throws ExecutionException, InterruptedException {
        log.info("Creating collection: {} with size {}", collectionName, size);
        client.createCollectionAsync(collectionName, 
            VectorParams.newBuilder()
                .setDistance(Distance.Cosine)
                .setSize(size)
                .build())
            .get();
    }

    private void validateAndFixCollection() {
        try {
            var info = client.getCollectionInfoAsync(collectionName).get();
            long currentSize = info.getConfig().getParams().getVectorsConfig().getParams().getSize();
            if (currentSize != 768) {
                log.warn("Qdrant dimension mismatch (Found {}, Expected 768). Recreating collection...", currentSize);
                client.deleteCollectionAsync(collectionName).get();
                createCollection(768);
            }
        } catch (Exception e) {
            log.error("Failed to validate Qdrant collection: {}", e.getMessage());
        }
    }

    private boolean collectionExists() {
        try {
            return client.listCollectionsAsync().get().contains(collectionName);
        } catch (Exception e) {
            return false;
        }
    }

    public void upsertDocumentChunks(String moduleId, String courseId, List<String> chunks, List<List<Float>> embeddings) {
        if (!initialized || client == null) return;

        try {
            List<PointStruct> points = new ArrayList<>();
            for (int i = 0; i < chunks.size(); i++) {
                String pointId = UUID.randomUUID().toString();
                Map<String, io.qdrant.client.grpc.JsonWithInt.Value> payload = Map.of(
                    "module_id", value(moduleId),
                    "course_id", value(courseId),
                    "chunk_index", value(i),
                    "text", value(chunks.get(i))
                );

                points.add(PointStruct.newBuilder()
                    .setId(id(UUID.fromString(pointId)))
                    .setVectors(vectors(embeddings.get(i)))
                    .putAllPayload(payload)
                    .build());
            }

            if (!points.isEmpty()) {
                client.upsertAsync(collectionName, points).get();
                log.info("Upserted {} chunks for module {}", points.size(), moduleId);
            }
        } catch (Exception e) {
            log.error("Failed to upsert chunks to Qdrant: {}", e.getMessage());
        }
    }

    public List<String> findSimilarContext(List<Float> queryEmbedding, String moduleId, int topK) {
        if (!initialized || client == null) return List.of();

        try {
            // Filter by moduleId
            Filter filter = Filter.newBuilder()
                .addMust(Condition.newBuilder()
                    .setField(FieldCondition.newBuilder()
                        .setKey("module_id")
                        .setMatch(Match.newBuilder().setKeyword(moduleId).build())
                        .build())
                    .build())
                .build();

            SearchPoints searchRequest = SearchPoints.newBuilder()
                .setCollectionName(collectionName)
                .addAllVector(queryEmbedding)
                .setFilter(filter)
                .setLimit(topK)
                .setWithPayload(WithPayloadSelector.newBuilder().setEnable(true).build())
                .setScoreThreshold(0.7f) // Threshold of 0.7 as requested
                .build();

            List<ScoredPoint> results = client.searchAsync(searchRequest).get();
            
            return results.stream()
                .map(p -> p.getPayloadMap().get("text").getStringValue())
                .toList();

        } catch (Exception e) {
            log.error("Failed to search Qdrant: {}", e.getMessage());
            return List.of();
        }
    }

    public void deleteModuleVectors(String moduleId) {
        if (!initialized || client == null) return;

        try {
            Filter filter = Filter.newBuilder()
                .addMust(Condition.newBuilder()
                    .setField(FieldCondition.newBuilder()
                        .setKey("module_id")
                        .setMatch(Match.newBuilder().setKeyword(moduleId).build())
                        .build())
                    .build())
                .build();

            client.deleteAsync(collectionName, filter).get();
            log.info("Deleted vectors for module {}", moduleId);
        } catch (Exception e) {
            log.error("Failed to delete vectors from Qdrant: {}", e.getMessage());
        }
    }

    @PreDestroy
    public void close() {
        if (client != null) {
            client.close();
        }
    }

    private static PointId id(UUID uuid) {
        return PointId.newBuilder().setUuid(uuid.toString()).build();
    }

    private static Vectors vectors(List<Float> vector) {
        return Vectors.newBuilder()
            .setVector(io.qdrant.client.grpc.Points.Vector.newBuilder().addAllData(vector).build())
            .build();
    }
}
