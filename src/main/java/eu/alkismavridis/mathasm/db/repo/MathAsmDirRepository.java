package eu.alkismavridis.mathasm.db.repo;

import eu.alkismavridis.mathasm.db.entities.MathAsmDirEntity;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.repository.query.Param;


public interface MathAsmDirRepository extends Neo4jRepository<MathAsmDirEntity, Long> {
    @Query("MATCH (o :dir)-[r:STMT|DIR]->(n) where ID(o)={id} and n.name={name} return count(n)>0;")
    boolean hasChildWithName(@Param("id") Long id, @Param("name") String name);

    @Query("MATCH (par :dir)-[r:DIR]->(chld :dir) where ID(chld)={id} return ID(par);")
    Long findParentIdOfDir(@Param("id") Long id);

    /** Deletes connections to subdirectories, statements or symbols. */
    @Query("match (parent)-[r]-(child) where ID(parent)={parentId} and ID(child)={childId} delete r;")
    void deleteChild(@Param("parentId") Long parentId, @Param("childId") Long childId);
}
