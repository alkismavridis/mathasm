package eu.alkismavridis.mathasm.infrastructure.db.repo;

import eu.alkismavridis.mathasm.infrastructure.db.entities.MathAsmSymbol;
import org.springframework.data.neo4j.annotation.Depth;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface SymbolRepository extends Neo4jRepository<MathAsmSymbol, Long> {

    MathAsmSymbol findByUid(long uid, @Depth int depth);

    @Query("MATCH (m:symbol) where m.uid>={idFrom} and m.uid<={idTo} RETURN m")
    List<MathAsmSymbol> findByIdRange(@Param("idFrom") Long idFrom, @Param("idTo") Long idTo);

    @Query("MATCH (m:symbol) where m.text={text} RETURN m LIMIT 1")
    MathAsmSymbol findByText(@Param("text") String text);

    @Query("MATCH (m:symbol) where m.text={text} or m.uid={id} RETURN m LIMIT 1")
    MathAsmSymbol findBySymbolIdOrText(@Param("id") Long id, @Param("text") String text);

    @Query("MATCH (m:symbol) where m.uid in {ids} return m")
    List<MathAsmSymbol> findAllByUid(@Param("ids") List<Long> ids);
}
