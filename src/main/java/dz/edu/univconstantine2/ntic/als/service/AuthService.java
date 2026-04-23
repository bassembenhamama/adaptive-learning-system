package dz.edu.univconstantine2.ntic.als.service;

import dz.edu.univconstantine2.ntic.als.dto.AuthRequest;
import dz.edu.univconstantine2.ntic.als.dto.DtoMapper;
import dz.edu.univconstantine2.ntic.als.dto.UserResponseDTO;
import dz.edu.univconstantine2.ntic.als.model.User;
import dz.edu.univconstantine2.ntic.als.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(rollbackFor = Exception.class)
    public UserResponseDTO register(AuthRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists.");
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

        return DtoMapper.toUserDTO(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new NoSuchElementException("Session expired"));
        return DtoMapper.toUserDTO(user);
    }
}
