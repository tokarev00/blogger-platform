import request from "supertest";
import express from "express";
import {setupApp} from "../src/setup-app";
import {runDb, closeDb} from "../src/db/mongo-db";
import {HttpStatus} from "../src/core/types/http-statuses";

const app = setupApp(express());
const authHeader = "Basic " + Buffer.from("admin:qwerty").toString("base64");

beforeAll(async () => {
    await runDb();
});

afterAll(async () => {
    await closeDb();
});

beforeEach(async () => {
    await request(app).delete("/testing/all-data");
});

const createUser = async (login: string, email: string, password: string) => {
    const res = await request(app)
        .post("/users")
        .set("Authorization", authHeader)
        .send({login, email, password})
        .expect(HttpStatus.Created);

    return res.body;
};

const loginUser = async (loginOrEmail: string, password: string) => {
    const res = await request(app)
        .post("/auth/login")
        .send({loginOrEmail, password})
        .expect(HttpStatus.Ok);

    return res.body.accessToken as string;
};

const createBlog = async () => {
    const res = await request(app)
        .post("/blogs")
        .set("Authorization", authHeader)
        .send({
            name: "Test blog",
            description: "Blog description",
            websiteUrl: "https://example.com",
        })
        .expect(HttpStatus.Created);

    return res.body;
};

const createPost = async (blogId: string) => {
    const res = await request(app)
        .post("/posts")
        .set("Authorization", authHeader)
        .send({
            title: "Post",
            shortDescription: "Short",
            content: "Content",
            blogId,
        })
        .expect(HttpStatus.Created);

    return res.body;
};

describe("/auth/me", () => {
    it("should return current user info when token is valid", async () => {
        const user = await createUser("john", "john@example.com", "password123");
        const token = await loginUser("john", "password123");

        const res = await request(app)
            .get("/auth/me")
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.Ok);

        expect(res.body).toEqual({
            email: "john@example.com",
            login: "john",
            userId: user.id,
        });
    });

    it("should return 401 without token", async () => {
        await request(app).get("/auth/me").expect(HttpStatus.Unauthorized);
    });
});

describe("comments", () => {
    const commentContent = "This is a very informative comment text.";

    it("should require auth to create comment", async () => {
        const blog = await createBlog();
        const post = await createPost(blog.id);

        await request(app)
            .post(`/posts/${post.id}/comments`)
            .send({content: commentContent})
            .expect(HttpStatus.Unauthorized);
    });

    it("should handle comment lifecycle", async () => {
        const blog = await createBlog();
        const post = await createPost(blog.id);
        const user = await createUser("alice", "alice@example.com", "password123");
        const token = await loginUser("alice", "password123");

        const createRes = await request(app)
            .post(`/posts/${post.id}/comments`)
            .set("Authorization", `Bearer ${token}`)
            .send({content: commentContent})
            .expect(HttpStatus.Created);

        expect(createRes.body).toEqual({
            id: expect.any(String),
            content: commentContent,
            commentatorInfo: {
                userId: user.id,
                userLogin: user.login,
            },
            createdAt: expect.any(String),
        });

        const commentId = createRes.body.id as string;

        const listRes = await request(app)
            .get(`/posts/${post.id}/comments`)
            .expect(HttpStatus.Ok);

        expect(listRes.body.items).toHaveLength(1);
        expect(listRes.body.items[0]).toEqual(createRes.body);

        const getRes = await request(app)
            .get(`/comments/${commentId}`)
            .expect(HttpStatus.Ok);
        expect(getRes.body).toEqual(createRes.body);

        await request(app)
            .put(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({content: `${commentContent} Updated`})
            .expect(HttpStatus.NoContent);

        const updatedRes = await request(app)
            .get(`/comments/${commentId}`)
            .expect(HttpStatus.Ok);
        expect(updatedRes.body.content).toBe(`${commentContent} Updated`);

        await request(app)
            .delete(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.NoContent);

        await request(app)
            .get(`/comments/${commentId}`)
            .expect(HttpStatus.NotFound);
    });

    it("should restrict editing to comment owner", async () => {
        const blog = await createBlog();
        const post = await createPost(blog.id);
        await createUser("owner", "owner@example.com", "password123");
        const ownerToken = await loginUser("owner", "password123");
        await createUser("guest", "guest@example.com", "password123");
        const guestToken = await loginUser("guest", "password123");

        const commentRes = await request(app)
            .post(`/posts/${post.id}/comments`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({content: commentContent})
            .expect(HttpStatus.Created);

        await request(app)
            .put(`/comments/${commentRes.body.id}`)
            .set("Authorization", `Bearer ${guestToken}`)
            .send({content: commentContent})
            .expect(HttpStatus.Forbidden);

        await request(app)
            .delete(`/comments/${commentRes.body.id}`)
            .set("Authorization", `Bearer ${guestToken}`)
            .expect(HttpStatus.Forbidden);
    });
});
