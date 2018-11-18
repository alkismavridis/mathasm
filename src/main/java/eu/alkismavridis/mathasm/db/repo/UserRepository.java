package eu.alkismavridis.mathasm.db.repo;

import eu.alkismavridis.mathasm.db.entities.User;
import org.springframework.data.neo4j.repository.Neo4jRepository;


public interface UserRepository extends Neo4jRepository<User, Long> {
    User findByUserName(String name);
}
