package dz.edu.univconstantine2.ntic.als.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private Map<String, Object> jwt;
    private Map<String, Object> upload;
    private Map<String, Object> security;

    public Map<String, Object> getJwt() {
        return jwt;
    }

    public void setJwt(Map<String, Object> jwt) {
        this.jwt = jwt;
    }

    public Map<String, Object> getUpload() {
        return upload;
    }

    public void setUpload(Map<String, Object> upload) {
        this.upload = upload;
    }

    public Map<String, Object> getSecurity() {
        return security;
    }

    public void setSecurity(Map<String, Object> security) {
        this.security = security;
    }
}
