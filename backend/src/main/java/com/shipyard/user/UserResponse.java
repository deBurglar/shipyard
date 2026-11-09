package com.shipyard.user;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(UUID id, String displayName, String email, Instant createdAt) {
}
