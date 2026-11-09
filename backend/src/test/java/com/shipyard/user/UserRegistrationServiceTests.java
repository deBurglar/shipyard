package com.shipyard.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class UserRegistrationServiceTests {

	@Autowired
	private UserRegistrationService userRegistrationService;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Test
	void registersUserWithEncodedPassword() {
		String displayName = "Ada Lovelace";
		String email = uniqueEmail();
		String rawPassword = "correct-horse-battery-staple";

		User registeredUser = userRegistrationService.register(displayName, email, rawPassword);
		User retrievedUser = userRepository.findByEmail(email).orElseThrow();

		assertNotNull(registeredUser.getId());
		assertEquals(registeredUser.getId(), retrievedUser.getId());
		assertEquals(displayName, retrievedUser.getDisplayName());
		assertNotEquals(rawPassword, retrievedUser.getPasswordHash());
		assertTrue(passwordEncoder.matches(rawPassword, retrievedUser.getPasswordHash()));
	}

	@Test
	void rejectsDuplicateEmail() {
		String email = uniqueEmail();
		userRegistrationService.register("First User", email, "first-password");

		assertThrows(IllegalArgumentException.class,
				() -> userRegistrationService.register("Second User", email, "second-password"));
	}

	private String uniqueEmail() {
		return UUID.randomUUID() + "@example.test";
	}

}
