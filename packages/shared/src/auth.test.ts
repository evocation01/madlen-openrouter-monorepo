import { describe, it, expect } from "vitest";
import { LoginSchema, RegisterSchema } from "./auth";

describe("Auth Schemas", () => {
  describe("LoginSchema", () => {
    it("should validate a correct login payload", () => {
      const result = LoginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should fail on invalid email", () => {
      const result = LoginSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should fail on empty password", () => {
      const result = LoginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("RegisterSchema", () => {
    it("should validate a correct register payload", () => {
      const result = RegisterSchema.safeParse({
        email: "newuser@example.com",
        password: "strongpassword",
        name: "John Doe",
      });
      expect(result.success).toBe(true);
    });

    it("should fail when password is too short", () => {
      const result = RegisterSchema.safeParse({
        email: "newuser@example.com",
        password: "123",
        name: "John Doe",
      });
      expect(result.success).toBe(false);
    });

    it("should fail when name is missing", () => {
      const result = RegisterSchema.safeParse({
        email: "newuser@example.com",
        password: "strongpassword",
      });
      expect(result.success).toBe(false);
    });
  });
});
