package com.notesmd.notes.config;

import java.util.Arrays;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    /**
     * MN 260508 Comma-separated {@code Origin} header values for CORS (e.g. {@code http://localhost:5173} for Vite).
     * Include the literal token {@code null} so packaged Electron renderers ({@code file://}) that send
     * {@code Origin: null} to the API are permitted.
     */
    private String allowedOrigins = "http://localhost:5173,null";

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
