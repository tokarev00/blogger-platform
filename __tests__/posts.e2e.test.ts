import request from "supertest";
import express from "express";
import { setupApp } from "../src/setup-app";
import { HttpStatus } from "../src/core/types/http-statuses";

const app = setupApp(express());
const authHeader = "Basic " + Buffer.from("admin:qwerty").toString("base64");
const nonExistingId = "123456789012345678901234";

const createBlog = async () => {
  const res = await request(app)
    .post("/blogs")
    .set("Authorization", authHeader)
    .send({
      name: "Blog",
      description: "Desc",
      websiteUrl: "https://example.com",
    });
  return res.body;
};

describe("/posts", () => {
  beforeEach(async () => {
    await request(app).delete("/testing/all-data");
  });

  it("should return an empty array", async () => {
    const res = await request(app).get("/posts").expect(HttpStatus.Ok);
    expect(res.body).toEqual([]);
  });

  it("should not create post without auth", async () => {
    await request(app)
      .post("/posts")
      .send({
        title: "T",
        shortDescription: "S",
        content: "C",
        blogId: nonExistingId,
      })
      .expect(HttpStatus.Unauthorized);
  });

  it("should return 404 when blog not found", async () => {
    await request(app)
      .post("/posts")
      .set("Authorization", authHeader)
      .send({
        title: "T",
        shortDescription: "S",
        content: "C",
        blogId: nonExistingId,
      })
      .expect(HttpStatus.NotFound);
  });

  it("should not create post with invalid data", async () => {
    const blog = await createBlog();
    await request(app)
      .post("/posts")
      .set("Authorization", authHeader)
      .send({
        title: "",
        shortDescription: "S",
        content: "C",
        blogId: blog.id,
      })
      .expect(HttpStatus.BadRequest);
  });

  it("should create and get post", async () => {
    const blog = await createBlog();
    const createRes = await request(app)
      .post("/posts")
      .set("Authorization", authHeader)
      .send({
        title: "Post",
        shortDescription: "Short",
        content: "Content",
        blogId: blog.id,
      })
      .expect(HttpStatus.Created);

    expect(createRes.body).toEqual({
      id: expect.any(String),
      title: "Post",
      shortDescription: "Short",
      content: "Content",
      blogId: blog.id,
      blogName: blog.name,
    });

    const getRes = await request(app)
      .get(`/posts/${createRes.body.id}`)
      .expect(HttpStatus.Ok);

    expect(getRes.body).toEqual(createRes.body);
  });

  it("should update post", async () => {
    const blog = await createBlog();
    const postRes = await request(app)
      .post("/posts")
      .set("Authorization", authHeader)
      .send({
        title: "Post",
        shortDescription: "Short",
        content: "Content",
        blogId: blog.id,
      });
    const newBlog = await request(app)
      .post("/blogs")
      .set("Authorization", authHeader)
      .send({
        name: "Another",
        description: "Desc",
        websiteUrl: "https://example.org",
      });

    await request(app)
      .put(`/posts/${postRes.body.id}`)
      .set("Authorization", authHeader)
      .send({
        title: "New",
        shortDescription: "New short",
        content: "New content",
        blogId: newBlog.body.id,
      })
      .expect(HttpStatus.NoContent);

    const getRes = await request(app)
      .get(`/posts/${postRes.body.id}`)
      .expect(HttpStatus.Ok);

    expect(getRes.body).toEqual({
      id: postRes.body.id,
      title: "New",
      shortDescription: "New short",
      content: "New content",
      blogId: newBlog.body.id,
      blogName: newBlog.body.name,
    });
  });

  it("should delete post", async () => {
    const blog = await createBlog();
    const postRes = await request(app)
      .post("/posts")
      .set("Authorization", authHeader)
      .send({
        title: "Post",
        shortDescription: "Short",
        content: "Content",
        blogId: blog.id,
      });

    await request(app)
      .delete(`/posts/${postRes.body.id}`)
      .set("Authorization", authHeader)
      .expect(HttpStatus.NoContent);

    await request(app)
      .get(`/posts/${postRes.body.id}`)
      .expect(HttpStatus.NotFound);
  });
});
