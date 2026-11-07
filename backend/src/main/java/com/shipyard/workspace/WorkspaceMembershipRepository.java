package com.shipyard.workspace;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceMembershipRepository extends JpaRepository<WorkspaceMembership, UUID> {

	List<WorkspaceMembership> findAllByWorkspace_Id(UUID workspaceId);

	List<WorkspaceMembership> findAllByUser_Id(UUID userId);

	boolean existsByWorkspace_IdAndUser_Id(UUID workspaceId, UUID userId);

}
