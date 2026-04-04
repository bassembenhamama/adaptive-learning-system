package dz.edu.univconstantine2.ntic.als.repository;

import dz.edu.univconstantine2.ntic.als.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
