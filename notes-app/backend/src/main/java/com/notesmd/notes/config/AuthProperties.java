package com.notesmd.notes.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** Operator policy for sign-up and sign-in ({@code app.auth.*}). */
@ConfigurationProperties(prefix = "app.auth")
@Validated
public class AuthProperties {

    private boolean registrationEnabled = true;

    @Min(1)
    private int loginMaxFailures = 5;

    @NotNull
    private Duration loginLockout = Duration.ofMinutes(15);

    public boolean isRegistrationEnabled() {
        return registrationEnabled;
    }

    public void setRegistrationEnabled(boolean registrationEnabled) {
        this.registrationEnabled = registrationEnabled;
    }

    public int getLoginMaxFailures() {
        return loginMaxFailures;
    }

    public void setLoginMaxFailures(int loginMaxFailures) {
        this.loginMaxFailures = loginMaxFailures;
    }

    public Duration getLoginLockout() {
        return loginLockout;
    }

    public void setLoginLockout(Duration loginLockout) {
        this.loginLockout = loginLockout;
    }
}
