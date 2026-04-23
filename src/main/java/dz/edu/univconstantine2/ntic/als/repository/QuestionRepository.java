package dz.edu.univconstantine2.ntic.als.repository;

import dz.edu.univconstantine2.ntic.als.model.DifficultyLevel;
import dz.edu.univconstantine2.ntic.als.model.Question;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, String> {

    List<Question> findAllByModuleIdOrderByCreatedAtDesc(String moduleId);

    List<Question> findAllByModuleIdAndDifficultyLevel(String moduleId, DifficultyLevel difficultyLevel);

    @Query("SELECT q FROM Question q WHERE q.module.id = :moduleId " +
           "AND q.difficultyLevel = :difficulty " +
           "AND q.id NOT IN :excludedIds " +
           "ORDER BY function('RAND')")
    List<Question> findRandomQuestions(@Param("moduleId") String moduleId,
                                       @Param("difficulty") DifficultyLevel difficulty,
                                       @Param("excludedIds") List<String> excludedIds,
                                       Pageable pageable);

    // Overload for when no IDs are excluded
    @Query("SELECT q FROM Question q WHERE q.module.id = :moduleId " +
           "AND q.difficultyLevel = :difficulty " +
           "ORDER BY function('RAND')")
    List<Question> findRandomQuestions(@Param("moduleId") String moduleId,
                                       @Param("difficulty") DifficultyLevel difficulty,
                                       Pageable pageable);

    long countByModuleId(String moduleId);

    @Modifying
    @Query("UPDATE Question q SET q.timesAnswered = q.timesAnswered + 1, " +
           "q.timesCorrect = q.timesCorrect + :incrementCorrect " +
           "WHERE q.id = :id")
    void incrementStats(@Param("id") String id, @Param("incrementCorrect") int incrementCorrect);
}
