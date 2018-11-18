package eu.alkismavridis.mathasm.db.repo;

import eu.alkismavridis.mathasm.db.entities.MathAsmProof;
import eu.alkismavridis.mathasm.db.entities.MathAsmTheory;
import org.springframework.data.neo4j.repository.Neo4jRepository;


public interface MathAsmProofRepository extends Neo4jRepository<MathAsmProof, Long> {
}
