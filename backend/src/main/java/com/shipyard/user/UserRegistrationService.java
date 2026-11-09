package com.shipyard.user;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserRegistrationService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserRegistrationService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public User register(String displayName, String email, String rawPassword) {
		if (userRepository.findByEmail(email).isPresent()) {
			throw new EmailAlreadyExistsException("A user with this email already exists.");
		}

		String encodedPassword = passwordEncoder.encode(rawPassword);
		User user = new User(displayName, email, encodedPassword);
		return userRepository.saveAndFlush(user);
	}
}
