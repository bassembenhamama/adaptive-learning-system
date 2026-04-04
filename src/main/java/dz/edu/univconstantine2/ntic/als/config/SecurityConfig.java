package dz.edu.univconstantine2.ntic.als.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/favicon.svg", "/icons.svg").permitAll()
                .requestMatchers("/assets/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/files/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/files/**").authenticated()
                .requestMatchers("/api/users/me/**").authenticated()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/courses/**").hasAnyRole("LEARNER", "INSTRUCTOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/courses/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/courses/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/courses/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/modules/**").hasAnyRole("LEARNER", "INSTRUCTOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/modules/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/modules/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/modules/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                .requestMatchers("/api/enrollments/**").hasRole("LEARNER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
