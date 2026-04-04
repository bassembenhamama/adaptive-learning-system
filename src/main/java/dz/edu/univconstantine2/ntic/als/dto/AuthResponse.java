package dz.edu.univconstantine2.ntic.als.dto;

import dz.edu.univconstantine2.ntic.als.model.User;

public class AuthResponse {
    private String token;
    private UserDto user;

    public AuthResponse(String token, User user) {
        this.token = token;
        this.user = new UserDto(user);
    }

    public String getToken() { return token; }
    public UserDto getUser() { return user; }

    public static class UserDto {
        private Long id;
        private String email;
        private String name;
        private String initials;
        private String role;

        public UserDto(User user) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.name = user.getName();
            this.initials = user.getInitials();
            this.role = user.getRole();
        }

        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public String getInitials() { return initials; }
        public String getRole() { return role; }
    }
}
