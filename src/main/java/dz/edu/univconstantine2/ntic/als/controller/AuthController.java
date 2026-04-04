package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.AuthRequest;
import dz.edu.univconstantine2.ntic.als.dto.AuthResponse;
import dz.edu.univconstantine2.ntic.als.dto.ErrorResponse;
import dz.edu.univconstantine2.ntic.als.model.User;
import dz.edu.univconstantine2.ntic.als.repository.UserRepository;
import dz.edu.univconstantine2.ntic.als.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(409, "An account with this email already exists."));
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName() != null ? request.getName() : "User");
        user.setRole(request.getRole() != null ? request.getRole() : "LEARNER");

        String initials = "";
        if (request.getName() != null && !request.getName().isBlank()) {
            String[] parts = request.getName().trim().split("\\s+");
            initials = parts[0].substring(0, 1).toUpperCase();
            if (parts.length > 1) {
                initials += parts[parts.length - 1].substring(0, 1).toUpperCase();
            }
        }
        user.setInitials(initials.isEmpty() ? "U" : initials);

        userRepository.save(user);

        String jwt = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(jwt, user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String jwt = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(jwt, user));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Session expired. Please log in again."));
        }
        return ResponseEntity.ok(new AuthResponse.UserDto(user));
    }
}
