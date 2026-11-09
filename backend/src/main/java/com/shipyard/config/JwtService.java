package com.shipyard.config;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtService {

	private final SecretKey signingKey;
	private final long expirationMs;

	public JwtService(
			@Value("${app.jwt.secret}") String base64Secret,
			@Value("${app.jwt.expiration-ms}") long expirationMs) {
		if (expirationMs <= 0) {
			throw new IllegalArgumentException("JWT expiration must be positive.");
		}

		this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64Secret));
		this.expirationMs = expirationMs;
	}

	public String generateToken(UUID userId) {
		Instant issuedAt = Instant.now();
		Instant expiration = issuedAt.plusMillis(expirationMs);

		return Jwts.builder()
				.subject(userId.toString())
				.issuedAt(Date.from(issuedAt))
				.expiration(Date.from(expiration))
				.signWith(signingKey, Jwts.SIG.HS256)
				.compact();
	}

	public UUID extractUserId(String token) {
		String subject = Jwts.parser()
				.verifyWith(signingKey)
				.build()
				.parseSignedClaims(token)
				.getPayload()
				.getSubject();
		return UUID.fromString(subject);
	}

	public boolean isTokenValid(String token) {
		if (token == null || token.isBlank()) {
			return false;
		}

		try {
			extractUserId(token);
			return true;
		} catch (JwtException | IllegalArgumentException exception) {
			return false;
		}
	}
}
