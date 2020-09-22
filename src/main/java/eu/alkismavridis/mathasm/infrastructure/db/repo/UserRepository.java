package eu.alkismavridis.mathasm.infrastructure.db.repo;

import eu.alkismavridis.mathasm.infrastructure.db.entities.User;
import org.springframework.data.neo4j.repository.Neo4jRepository;


public interface UserRepository extends Neo4jRepository<User, Long> {
    User findByUserName(String name);
}
