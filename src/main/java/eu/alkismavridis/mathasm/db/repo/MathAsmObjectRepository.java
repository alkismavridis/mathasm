package eu.alkismavridis.mathasm.db.repo;

import eu.alkismavridis.mathasm.db.entities.MathAsmObjectEntity;
import eu.alkismavridis.mathasm.db.entities.MathAsmStatementEntity;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.repository.query.Param;


public interface MathAsmObjectRepository extends Neo4jRepository<MathAsmObjectEntity, Long> {
    //@Query("MATCH (th:MathAsmTheory)-[ROOT]->(n:MathAsmObjectEntity) WITH n RETURN n,[ [ (n)-[r_r1:`ROOT`]->(l1:`MathAsmObjectEntity`) | [ r_r1, l1 ] ] ]")
    //MathAsmObjectEntity rootObject();
}
