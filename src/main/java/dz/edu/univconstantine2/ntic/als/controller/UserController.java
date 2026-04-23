package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.ErrorResponse;
import dz.edu.univconstantine2.ntic.als.dto.PasswordChangeRequest;
import dz.edu.univconstantine2.ntic.als.dto.UserProfileRequest;
import dz.edu.univconstantine2.ntic.als.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(userService.getProfile(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            return ResponseEntity.ok(userService.updateProfile(email, request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(409, ex.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            return ResponseEntity.ok(userService.changePassword(email, request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, ex.getMessage()));
        }
    }

    /**
     * DELETE /api/users/me
     * Soft-deletes the authenticated user's own account, clears the JWT cookie,
     * and returns 200. The frontend must redirect to /login after this call.
     */
    @DeleteMapping
    public ResponseEntity<?> deleteSelf(HttpServletResponse response) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            userService.deleteSelf(email);
            // Clear the ALS_AUTH cookie — must match exact name/path used at login
            ResponseCookie clearCookie = ResponseCookie.from("ALS_AUTH", "")
                    .httpOnly(true)
                    .secure(false) // matches AuthController setting
                    .path("/api")
                    .sameSite("Strict")
                    .maxAge(0)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            log.error("Failed to delete account for {}: {}", email, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Failed to delete account."));
        }
    }
}
