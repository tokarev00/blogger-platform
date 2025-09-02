import request from "supertest";
import express from "express";
import { setupApp } from "../src/setup-app";
import { HttpStatus } from "../src/core/types/http-statuses";

const app = setupApp(express());
const authHeader = "Basic " + Buffer.from("admin:qwerty").toString("base64");
const nonExistingId = "123456789012345678901234";

describe("/blogs", () => {
  beforeEach(async () => {
    await request(app).delete("/testing/all-data");
  });

  it("should return an empty array", async () => {
    const res = await request(app).get("/blogs").expect(HttpStatus.Ok);
    expect(res.body).toEqual([]);
  });

  it("should return 404 for not existing blog", async () => {
    await request(app)
      .get(`/blogs/${nonExistingId}`)
      .expect(HttpStatus.NotFound);
  });

  it("should not create blog without auth", async () => {
    await request(app)
      .post("/blogs")
      .send({
        name: "Test",
        description: "Desc",
        websiteUrl: "https://example.com",
      })
      .expect(HttpStatus.Unauthorized);
  });

  it("should not create blog with invalid data", async () => {
    await request(app)
      .post("/blogs")
      .set("Authorization", authHeader)
      .send({
        name: "",
        description: "Desc",
        websiteUrl: "https://example.com",
      })
      .expect(HttpStatus.BadRequest);
  });

  it("should create and get blog", async () => {
    const createRes = await request(app)
      .post("/blogs")
      .set("Authorization", authHeader)
      .send({
        name: "MyBlog",
        description: "Blog description",
        websiteUrl: "https://example.com",
      })
      .expect(HttpStatus.Created);

    expect(createRes.body).toEqual({
      id: expect.any(String),
      name: "MyBlog",
      description: "Blog description",
      websiteUrl: "https://example.com",
    });

    const getRes = await request(app)
      .get(`/blogs/${createRes.body.id}`)
      .expect(HttpStatus.Ok);

    expect(getRes.body).toEqual(createRes.body);
  });

  it("should update blog", async () => {
    const createRes = await request(app)
      .post("/blogs")
      .set("Authorization", authHeader)
      .send({
        name: "Old",
        description: "Old desc",
        websiteUrl: "https://example.com",
      })
      .expect(HttpStatus.Created);

    await request(app)
      .put(`/blogs/${createRes.body.id}`)
      .set("Authorization", authHeader)
      .send({
        name: "New",
        description: "New desc",
        websiteUrl: "https://example.org",
      })
      .expect(HttpStatus.NoContent);

    const getRes = await request(app)
      .get(`/blogs/${createRes.body.id}`)
      .expect(HttpStatus.Ok);

    expect(getRes.body).toEqual({
      id: createRes.body.id,
      name: "New",
      description: "New desc",
      websiteUrl: "https://example.org",
    });
  });

  it("should delete blog", async () => {
    const createRes = await request(app)
      .post("/blogs")
      .set("Authorization", authHeader)
      .send({
        name: "ToDelete",
        description: "Desc",
        websiteUrl: "https://example.com",
      })
      .expect(HttpStatus.Created);

    await request(app)
      .delete(`/blogs/${createRes.body.id}`)
      .set("Authorization", authHeader)
      .expect(HttpStatus.NoContent);

    await request(app)
      .get(`/blogs/${createRes.body.id}`)
      .expect(HttpStatus.NotFound);
  });
});
