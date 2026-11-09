package com.shipyard.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

class JwtServiceTests {

	private static final String TEST_SECRET = Base64.getEncoder()
			.encodeToString("0123456789abcdef0123456789abcdef".getBytes());
	private static final long EXPIRATION_MS = 15 * 60 * 1000;

	private final JwtService jwtService = new JwtService(TEST_SECRET, EXPIRATION_MS);

	@Test
	void generateTokenProducesNonEmptyJwt() {
		String token = jwtService.generateToken(UUID.randomUUID());

		assertNotNull(token);
		assertFalse(token.isBlank());
		assertEquals(3, token.split("\\.").length);
	}

	@Test
	void generatedTokenExtractsUserId() {
		UUID userId = UUID.randomUUID();

		String token = jwtService.generateToken(userId);

		assertEquals(userId, jwtService.extractUserId(token));
	}

	@Test
	void generatedTokenIsValid() {
		String token = jwtService.generateToken(UUID.randomUUID());

		assertTrue(jwtService.isTokenValid(token));
	}

	@Test
	void malformedTokenIsRejected() {
		assertFalse(jwtService.isTokenValid("not.a.jwt"));
	}

	@Test
	void tamperedTokenIsRejected() {
		String token = jwtService.generateToken(UUID.randomUUID());
		int signatureStart = token.lastIndexOf('.') + 1;
		char replacement = token.charAt(signatureStart) == 'A' ? 'B' : 'A';
		String tamperedToken = token.substring(0, signatureStart)
				+ replacement
				+ token.substring(signatureStart + 1);

		assertFalse(jwtService.isTokenValid(tamperedToken));
	}

	@Test
	void expiredTokenIsRejected() {
		Instant now = Instant.now();
		String expiredToken = Jwts.builder()
				.subject(UUID.randomUUID().toString())
				.issuedAt(Date.from(now.minusSeconds(120)))
				.expiration(Date.from(now.minusSeconds(60)))
				.signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(TEST_SECRET)), Jwts.SIG.HS256)
				.compact();

		assertFalse(jwtService.isTokenValid(expiredToken));
	}
}
