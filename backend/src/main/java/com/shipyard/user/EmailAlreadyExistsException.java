package com.shipyard.user;

public class EmailAlreadyExistsException extends IllegalArgumentException {

	public EmailAlreadyExistsException(String message) {
		super(message);
	}

}
