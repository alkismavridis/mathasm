package eu.alkismavridis.mathasm.infrastructure.db.repo;

import eu.alkismavridis.mathasm.infrastructure.db.entities.MathAsmStatementEntity;
import org.springframework.data.neo4j.repository.Neo4jRepository;


public interface StatementRepository extends Neo4jRepository<MathAsmStatementEntity, Long> {
    //MathAsmStatementEntity findByUserName(String name);
}
