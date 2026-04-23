package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.AuthRequest;
import dz.edu.univconstantine2.ntic.als.dto.ErrorResponse;
import dz.edu.univconstantine2.ntic.als.dto.UserResponseDTO;
import dz.edu.univconstantine2.ntic.als.service.AuthService;
import dz.edu.univconstantine2.ntic.als.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.NoSuchElementException;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    /** Task 1-A: driven by env-var so prod can set COOKIE_SECURE=true */
    @Value("${app.security.cookie.secure:false}")
    private boolean cookieSecure;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request, HttpServletResponse response) {
        try {
            UserResponseDTO userDTO = authService.register(request);
            String jwt = jwtUtil.generateToken(userDTO.email());
            addAuthCookie(response, jwt);
            return ResponseEntity.status(HttpStatus.CREATED).body(userDTO);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(409, ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> login(@Valid @RequestBody AuthRequest request, HttpServletResponse response) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserResponseDTO userDTO = authService.getUserByEmail(request.getEmail());
        String jwt = jwtUtil.generateToken(userDTO.email());
        addAuthCookie(response, jwt);

        return ResponseEntity.ok(userDTO);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            return ResponseEntity.ok(authService.getUserByEmail(email));
        } catch (NoSuchElementException ex) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Session expired. Please log in again."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("ALS_AUTH", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api")
                .sameSite("Strict")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.noContent().build();
    }

    private void addAuthCookie(HttpServletResponse response, String jwt) {
        ResponseCookie cookie = ResponseCookie.from("ALS_AUTH", jwt)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api")
                .sameSite("Strict")
                .maxAge(Duration.ofDays(1).getSeconds())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
