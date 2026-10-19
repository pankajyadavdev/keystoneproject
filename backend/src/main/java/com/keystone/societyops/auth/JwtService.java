package com.keystone.societyops.auth;

import tools.jackson.databind.json.JsonMapper;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private static final String HEADER = Base64.getUrlEncoder().withoutPadding()
            .encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
    private final JsonMapper mapper;
    private final byte[] secret;
    private final long ttlHours;

    public JwtService(JsonMapper mapper,
                      @Value("${keystone.auth.jwt-secret}") String secret,
                      @Value("${keystone.auth.jwt-ttl-hours:12}") long ttlHours) {
        this.mapper = mapper;
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.ttlHours = ttlHours;
    }

    public String issue(String subject, String role) {
        try {
            long now = Instant.now().getEpochSecond();
            String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(mapper.writeValueAsBytes(
                    Map.of("sub", subject, "role", role, "iat", now, "exp", now + ttlHours * 3600)));
            String unsigned = HEADER + "." + payload;
            return unsigned + "." + sign(unsigned);
        } catch (Exception exception) {
            throw new IllegalStateException("Could not issue access token", exception);
        }
    }

    public Map<?, ?> verify(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3 || !constantTimeEquals(sign(parts[0] + "." + parts[1]), parts[2])) return null;
            Map<?, ?> claims = mapper.readValue(Base64.getUrlDecoder().decode(parts[1]), Map.class);
            Object expiration = claims.get("exp");
            if (!(expiration instanceof Number number) || number.longValue() <= Instant.now().getEpochSecond()) return null;
            return claims;
        } catch (Exception exception) {
            return null;
        }
    }

    private String sign(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    }

    private boolean constantTimeEquals(String expected, String actual) {
        return java.security.MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), actual.getBytes(StandardCharsets.UTF_8));
    }
}
