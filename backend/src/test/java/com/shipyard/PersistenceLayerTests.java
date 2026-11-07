package com.shipyard;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import com.shipyard.user.User;
import com.shipyard.user.UserRepository;
import com.shipyard.workspace.Workspace;
import com.shipyard.workspace.WorkspaceMembership;
import com.shipyard.workspace.WorkspaceMembershipRepository;
import com.shipyard.workspace.WorkspaceRepository;
import com.shipyard.workspace.WorkspaceRole;

import jakarta.persistence.EntityManager;

@SpringBootTest
@Transactional
class PersistenceLayerTests {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private WorkspaceRepository workspaceRepository;

	@Autowired
	private WorkspaceMembershipRepository membershipRepository;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void userCanBePersistedAndRetrieved() {
		String email = uniqueEmail();
		User saved = userRepository.saveAndFlush(new User("Ada Lovelace", email, "test-hash"));

		User retrieved = userRepository.findByEmail(email).orElseThrow();

		assertNotNull(saved.getId());
		assertEquals(saved.getId(), retrieved.getId());
		assertEquals("Ada Lovelace", retrieved.getDisplayName());
		assertNotNull(retrieved.getCreatedAt());
		assertNotNull(retrieved.getUpdatedAt());
	}

	@Test
	@Rollback
	void duplicateUserEmailIsRejectedByDatabaseConstraint() {
		String email = uniqueEmail();

		userRepository.saveAndFlush(new User("First User", email, "test-hash"));

		assertThrows(DataIntegrityViolationException.class,
				() -> userRepository.saveAndFlush(new User("Second User", email, "test-hash")));
	}

	@Test
	void workspaceCanBePersistedAndRetrieved() {
		Workspace saved = workspaceRepository.saveAndFlush(new Workspace("Harbor Labs"));

		Workspace retrieved = workspaceRepository.findById(saved.getId()).orElseThrow();

		assertEquals("Harbor Labs", retrieved.getName());
		assertNotNull(retrieved.getCreatedAt());
		assertNotNull(retrieved.getUpdatedAt());
	}

	@Test
	void membershipPersistsRelationshipsAndStringRole() {
		User user = userRepository.saveAndFlush(new User("Grace Hopper", uniqueEmail(), "test-hash"));
		Workspace workspace = workspaceRepository.saveAndFlush(new Workspace("Compiler Team"));
		WorkspaceMembership saved = membershipRepository
				.saveAndFlush(new WorkspaceMembership(user, workspace, WorkspaceRole.ADMIN));

		entityManager.clear();
		WorkspaceMembership retrieved = membershipRepository.findById(saved.getId()).orElseThrow();

		assertEquals(user.getId(), retrieved.getUser().getId());
		assertEquals(workspace.getId(), retrieved.getWorkspace().getId());
		assertEquals(WorkspaceRole.ADMIN, retrieved.getRole());
		assertEquals("ADMIN", jdbcTemplate.queryForObject(
				"SELECT role FROM workspace_memberships WHERE id = ?", String.class, saved.getId()));
		assertNotNull(retrieved.getJoinedAt());
		assertEquals(1, membershipRepository.findAllByWorkspace_Id(workspace.getId()).size());
		assertEquals(1, membershipRepository.findAllByUser_Id(user.getId()).size());
		assertTrue(membershipRepository.existsByWorkspace_IdAndUser_Id(workspace.getId(), user.getId()));
	}

	@Test
	@Rollback
	void duplicateWorkspaceMembershipIsRejectedByDatabaseConstraint() {
		User user = userRepository.saveAndFlush(new User("Katherine Johnson", uniqueEmail(), "test-hash"));
		Workspace workspace = workspaceRepository.saveAndFlush(new Workspace("Orbital Mechanics"));
		membershipRepository.saveAndFlush(new WorkspaceMembership(user, workspace, WorkspaceRole.MEMBER));

		assertThrows(DataIntegrityViolationException.class,
				() -> membershipRepository
						.saveAndFlush(new WorkspaceMembership(user, workspace, WorkspaceRole.MEMBER)));
	}

	private String uniqueEmail() {
		return UUID.randomUUID() + "@example.test";
	}

}
