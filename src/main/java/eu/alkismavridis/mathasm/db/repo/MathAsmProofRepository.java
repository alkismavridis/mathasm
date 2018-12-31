package eu.alkismavridis.mathasm.db.repo;

import eu.alkismavridis.mathasm.db.entities.MathAsmProof;
import eu.alkismavridis.mathasm.db.entities.MathAsmSymbol;
import eu.alkismavridis.mathasm.db.entities.MathAsmTheory;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.repository.query.Param;


public interface MathAsmProofRepository extends Neo4jRepository<MathAsmProof, Long> {
    @Query("MATCH (th:stmt)-[:PRF]-(p) where ID(th)={theoremId} RETURN p LIMIT 1")
    MathAsmProof findProofForTheoremId(@Param("theoremId") Long theoremId);
}
