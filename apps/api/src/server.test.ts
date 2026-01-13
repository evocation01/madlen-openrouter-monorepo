import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "./index";

describe("API Health Check", () => {
    it("GET /health should return 200 OK", async () => {
        const res = await request(app).get("/health");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: "ok", service: "api" });
    });
});
