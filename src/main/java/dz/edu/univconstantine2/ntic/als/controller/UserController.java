package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.AuthResponse;
import dz.edu.univconstantine2.ntic.als.dto.ErrorResponse;
import dz.edu.univconstantine2.ntic.als.dto.PasswordChangeRequest;
import dz.edu.univconstantine2.ntic.als.dto.UserProfileRequest;
import dz.edu.univconstantine2.ntic.als.model.User;
import dz.edu.univconstantine2.ntic.als.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(new AuthResponse.UserDto(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserProfileRequest request) {
        User user = getAuthenticatedUser();

        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ErrorResponse(409, "This email is already associated with another account."));
            }
            user.setEmail(request.getEmail());
        }

        user.setName(request.getName());

        String[] parts = request.getName().trim().split("\\s+");
        String initials = parts[0].substring(0, 1).toUpperCase();
        if (parts.length > 1) {
            initials += parts[parts.length - 1].substring(0, 1).toUpperCase();
        }
        user.setInitials(initials);

        userRepository.save(user);
        return ResponseEntity.ok(new AuthResponse.UserDto(user));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        User user = getAuthenticatedUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, "Current password is incorrect."));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new AuthResponse.UserDto(user));
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}
