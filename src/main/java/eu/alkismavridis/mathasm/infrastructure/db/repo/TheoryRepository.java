package eu.alkismavridis.mathasm.infrastructure.db.repo;

import eu.alkismavridis.mathasm.infrastructure.db.entities.MathAsmTheory;
import org.springframework.data.neo4j.repository.Neo4jRepository;


public interface TheoryRepository extends Neo4jRepository<MathAsmTheory, Long> {
}
