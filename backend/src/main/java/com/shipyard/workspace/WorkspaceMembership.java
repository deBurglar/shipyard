package com.shipyard.workspace;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.shipyard.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "workspace_memberships", uniqueConstraints = {
		@UniqueConstraint(name = "uq_workspace_memberships_workspace_user", columnNames = { "workspace_id",
				"user_id" })
})
public class WorkspaceMembership {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "id", nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_workspace_memberships_user"))
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "workspace_id", nullable = false, foreignKey = @ForeignKey(name = "fk_workspace_memberships_workspace"))
	private Workspace workspace;

	@Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false, length = 20)
	private WorkspaceRole role;

	@CreationTimestamp
	@Column(name = "joined_at", nullable = false, updatable = false)
	private Instant joinedAt;

	protected WorkspaceMembership() {
	}

	public WorkspaceMembership(User user, Workspace workspace, WorkspaceRole role) {
		this.user = user;
		this.workspace = workspace;
		this.role = role;
	}

	public UUID getId() {
		return id;
	}

	public User getUser() {
		return user;
	}

	public Workspace getWorkspace() {
		return workspace;
	}

	public WorkspaceRole getRole() {
		return role;
	}

	public Instant getJoinedAt() {
		return joinedAt;
	}

}
