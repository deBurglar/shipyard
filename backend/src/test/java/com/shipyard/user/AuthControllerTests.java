package com.shipyard.user;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void registersUserAndReturnsSafeResponse() throws Exception {
		mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"displayName":"Ada Lovelace","email":"%s","password":"correct-horse-battery-staple"}
						""".formatted(uniqueEmail())))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").isNotEmpty())
				.andExpect(jsonPath("$.displayName").value("Ada Lovelace"))
				.andExpect(jsonPath("$.email").isNotEmpty())
				.andExpect(jsonPath("$.createdAt").isNotEmpty())
				.andExpect(jsonPath("$.passwordHash").doesNotExist())
				.andExpect(jsonPath("$.password").doesNotExist());
	}

	@Test
	void duplicateEmailReturnsConflict() throws Exception {
		String email = uniqueEmail();
		String request = """
				{"displayName":"Ada Lovelace","email":"%s","password":"correct-horse-battery-staple"}
				""".formatted(email);

		mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(request))
				.andExpect(status().isCreated());

		mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"displayName":"Another User","email":"%s","password":"another-password"}
						""".formatted(email)))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("A user with this email already exists."));
	}

	@Test
	void invalidRequestReturnsBadRequest() throws Exception {
		mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"displayName":"","email":"not-an-email","password":"short"}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").isNotEmpty());
	}

	private String uniqueEmail() {
		return UUID.randomUUID() + "@example.test";
	}
}
