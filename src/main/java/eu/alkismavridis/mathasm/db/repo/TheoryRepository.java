package eu.alkismavridis.mathasm.db.repo;

import eu.alkismavridis.mathasm.db.entities.MathAsmTheory;
import org.springframework.data.neo4j.repository.Neo4jRepository;


public interface TheoryRepository extends Neo4jRepository<MathAsmTheory, Long> {
}
