package eu.alkismavridis.mathasm.db.repo;

import eu.alkismavridis.mathasm.db.entities.MathAsmStatementEntity;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface StatementRepository extends Neo4jRepository<MathAsmStatementEntity, Long> {
    //MathAsmStatementEntity findByUserName(String name);
}
