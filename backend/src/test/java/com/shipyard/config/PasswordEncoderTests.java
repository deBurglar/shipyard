package com.shipyard.config;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class PasswordEncoderTests {

	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	@Test
	void encodedPasswordIsDifferentFromRawPassword() {
		String rawPassword = "correct-horse-battery-staple";

		assertNotEquals(rawPassword, passwordEncoder.encode(rawPassword));
	}

	@Test
	void matchesOnlyTheCorrectPassword() {
		String rawPassword = "correct-horse-battery-staple";
		String encodedPassword = passwordEncoder.encode(rawPassword);

		assertTrue(passwordEncoder.matches(rawPassword, encodedPassword));
		assertFalse(passwordEncoder.matches("incorrect-password", encodedPassword));
	}

	@Test
	void encodingSamePasswordTwiceProducesDifferentHashes() {
		String rawPassword = "correct-horse-battery-staple";

		assertNotEquals(passwordEncoder.encode(rawPassword), passwordEncoder.encode(rawPassword));
	}

}
