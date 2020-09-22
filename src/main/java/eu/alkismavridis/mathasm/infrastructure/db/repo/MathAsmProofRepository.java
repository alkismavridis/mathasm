package eu.alkismavridis.mathasm.infrastructure.db.repo;

import eu.alkismavridis.mathasm.infrastructure.db.entities.MathAsmProof;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.repository.query.Param;


public interface MathAsmProofRepository extends Neo4jRepository<MathAsmProof, Long> {
    @Query("MATCH (th:stmt)-[:PRF]-(p) where ID(th)={theoremId} RETURN p LIMIT 1")
    MathAsmProof findProofForTheoremId(@Param("theoremId") Long theoremId);
}
