package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.AuthResponse;
import dz.edu.univconstantine2.ntic.als.dto.ErrorResponse;
import dz.edu.univconstantine2.ntic.als.model.User;
import dz.edu.univconstantine2.ntic.als.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<AuthResponse.UserDto>> getAllUsers() {
        List<AuthResponse.UserDto> users = userRepository.findAll()
                .stream()
                .map(AuthResponse.UserDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        if (newRole == null || newRole.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, "Role is required."));
        }

        if (!newRole.equals("LEARNER") && !newRole.equals("INSTRUCTOR") && !newRole.equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, "Invalid role. Must be LEARNER, INSTRUCTOR, or ADMIN."));
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "User not found."));
        }

        user.setRole(newRole);
        userRepository.save(user);

        return ResponseEntity.ok(new AuthResponse.UserDto(user));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "User not found."));
        }
        userRepository.deleteById(userId);
        return ResponseEntity.noContent().build();
    }
}
