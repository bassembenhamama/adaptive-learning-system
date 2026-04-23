package dz.edu.univconstantine2.ntic.als.service;

import dz.edu.univconstantine2.ntic.als.dto.DtoMapper;
import dz.edu.univconstantine2.ntic.als.dto.PasswordChangeRequest;
import dz.edu.univconstantine2.ntic.als.dto.UserProfileRequest;
import dz.edu.univconstantine2.ntic.als.dto.UserResponseDTO;
import dz.edu.univconstantine2.ntic.als.model.User;
import dz.edu.univconstantine2.ntic.als.repository.CourseRepository;
import dz.edu.univconstantine2.ntic.als.repository.EnrollmentRepository;
import dz.edu.univconstantine2.ntic.als.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public UserResponseDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        return DtoMapper.toUserDTO(user);
    }

    @Transactional(rollbackFor = Exception.class)
    public UserResponseDTO updateProfile(String email, UserProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new IllegalArgumentException("This email is already associated with another account.");
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

        return DtoMapper.toUserDTO(userRepository.save(user));
    }

    @Transactional(rollbackFor = Exception.class)
    public UserResponseDTO changePassword(String email, PasswordChangeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        return DtoMapper.toUserDTO(userRepository.save(user));
    }
    
    // Admins only — legacy unbounded list (kept for backwards compat)
    @Transactional(readOnly = true)
    public java.util.List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(DtoMapper::toUserDTO).toList();
    }

    // Task 4-A — paginated version used by the rewritten AdminController
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getAllUsersPaged(Pageable pageable) {
        return userRepository.findAll(pageable).map(DtoMapper::toUserDTO);
    }

    // Task 4-B — count queries for admin stats
    @Transactional(readOnly = true)
    public long countUsers() {
        return userRepository.count();
    }

    @Transactional(rollbackFor = Exception.class)
    public UserResponseDTO updateUserRole(Long userId, String newRole) {
        if (!newRole.equals("LEARNER") && !newRole.equals("INSTRUCTOR") && !newRole.equals("ADMIN")) {
            throw new IllegalArgumentException("Invalid role. Must be LEARNER, INSTRUCTOR, or ADMIN.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        user.setRole(newRole);
        return DtoMapper.toUserDTO(userRepository.save(user));
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        // Soft-delete the user's enrollments
        enrollmentRepository.softDeleteByUserId(id);

        // Nullify instructor reference on courses taught by this user
        courseRepository.nullifyInstructor(id);

        // Soft-delete the user
        userRepository.delete(user);
        log.info("User and associated data soft-deleted: {}", id);
    }

    /**
     * Soft-deletes the currently authenticated user's own account.
     * Called from DELETE /api/users/me.
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteSelf(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        enrollmentRepository.softDeleteByUserId(user.getId());
        courseRepository.nullifyInstructor(user.getId());
        userRepository.delete(user);
        log.info("User self-deleted account: {} (id={})", email, user.getId());
    }
}


