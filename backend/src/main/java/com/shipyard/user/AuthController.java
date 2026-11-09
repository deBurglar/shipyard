package com.shipyard.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final UserRegistrationService userRegistrationService;

	public AuthController(UserRegistrationService userRegistrationService) {
		this.userRegistrationService = userRegistrationService;
	}

	@PostMapping("/register")
	public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
		User user = userRegistrationService.register(
				request.displayName(),
				request.email(),
				request.password());
		UserResponse response = new UserResponse(
				user.getId(),
				user.getDisplayName(),
				user.getEmail(),
				user.getCreatedAt());

		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
}
