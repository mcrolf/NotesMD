package com.notesmd.notes.config;

import java.util.Arrays;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    /**
     * Comma-separated {@code Origin} header values for CORS. {@code app://notesmd} is the packaged desktop app.
     * The literal {@code null} only serves desktop builds up to 1.0.3, which load from {@code file://}; remove it
     * once those builds are retired.
     */
    private String allowedOrigins = "http://localhost:5173,app://notesmd,null";

    public String getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(String allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    public String[] allowedOriginArray() {
        return Arrays.stream(allowedOrigins.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toArray(String[]::new);
    }
}
