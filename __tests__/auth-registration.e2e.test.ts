import request from "supertest";
import express from "express";
import {ObjectId} from "mongodb";
import {setupApp} from "../src/setup-app";
import {closeDb, runDb, usersCollection, UserDb} from "../src/db/mongo-db";
import {HttpStatus} from "../src/core/types/http-statuses";

const app = setupApp(express());

const createUnconfirmedUser = async (overrides: Partial<UserDb> = {}): Promise<UserDb> => {
    const user: UserDb = {
        _id: overrides._id ?? new ObjectId(),
        login: overrides.login ?? "john",
        email: overrides.email ?? "john@example.com",
        passwordHash: overrides.passwordHash ?? "hash",
        createdAt: overrides.createdAt ?? new Date().toISOString(),
        emailConfirmation: overrides.emailConfirmation ?? {
            isConfirmed: false,
            confirmationCode: "test-code",
            expirationDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
    };

    await usersCollection.insertOne(user);
    return user;
};

describe("registration", () => {
    beforeAll(async () => {
        await runDb();
    });

    afterAll(async () => {
        await closeDb();
    });

    beforeEach(async () => {
        await request(app).delete("/testing/all-data");
    });

    it("should create unconfirmed user and send 204", async () => {
        const login = "john_d";
        const email = "john_d@example.com";
        const password = "password";

        await request(app)
            .post("/auth/registration")
            .send({login, email, password})
            .expect(HttpStatus.NoContent);

        const user = await usersCollection.findOne({login});
        expect(user).not.toBeNull();
        expect(user?.email).toBe(email);
        expect(user?.passwordHash).not.toBe(password);
        expect(user?.emailConfirmation.isConfirmed).toBe(false);
        expect(user?.emailConfirmation.confirmationCode).not.toBeNull();
        expect(user?.emailConfirmation.expirationDate).not.toBeNull();
    });

    it("should return 400 when login is already taken", async () => {
        const login = "existing";
        await createUnconfirmedUser({login});

        const res = await request(app)
            .post("/auth/registration")
            .send({login, email: "new@example.com", password: "password"})
            .expect(HttpStatus.BadRequest);

        expect(res.body).toEqual({
            errorsMessages: [
                {
                    field: "login",
                    message: "login should be unique",
                },
            ],
        });
    });

    it("should return 400 when email is already taken", async () => {
        const email = "taken@example.com";
        await createUnconfirmedUser({email});

        const res = await request(app)
            .post("/auth/registration")
            .send({login: "newlogin", email, password: "password"})
            .expect(HttpStatus.BadRequest);

        expect(res.body).toEqual({
            errorsMessages: [
                {
                    field: "email",
                    message: "email should be unique",
                },
            ],
        });
    });
});

describe("registration confirmation", () => {
    beforeAll(async () => {
        await runDb();
    });

    afterAll(async () => {
        await closeDb();
    });

    beforeEach(async () => {
        await request(app).delete("/testing/all-data");
    });

    it("should activate account when code is valid", async () => {
        const code = "valid-code";
        const user = await createUnconfirmedUser({
            emailConfirmation: {
                isConfirmed: false,
                confirmationCode: code,
                expirationDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            },
        });

        await request(app)
            .post("/auth/registration-confirmation")
            .send({code})
            .expect(HttpStatus.NoContent);

        const updated = await usersCollection.findOne({_id: user._id});
        expect(updated?.emailConfirmation.isConfirmed).toBe(true);
        expect(updated?.emailConfirmation.confirmationCode).toBeNull();
        expect(updated?.emailConfirmation.expirationDate).toBeNull();
    });

    it("should return 400 when code is invalid", async () => {
        await createUnconfirmedUser({
            emailConfirmation: {
                isConfirmed: false,
                confirmationCode: "real-code",
                expirationDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            },
        });

        const res = await request(app)
            .post("/auth/registration-confirmation")
            .send({code: "wrong-code"})
            .expect(HttpStatus.BadRequest);

        expect(res.body).toEqual({
            errorsMessages: [
                {
                    field: "code",
                    message: "confirmation code is invalid or expired",
                },
            ],
        });
    });

    it("should return 400 when code is expired", async () => {
        const code = "expired";
        await createUnconfirmedUser({
            emailConfirmation: {
                isConfirmed: false,
                confirmationCode: code,
                expirationDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            },
        });

        await request(app)
            .post("/auth/registration-confirmation")
            .send({code})
            .expect(HttpStatus.BadRequest);
    });
});

describe("registration email resending", () => {
    beforeAll(async () => {
        await runDb();
    });

    afterAll(async () => {
        await closeDb();
    });

    beforeEach(async () => {
        await request(app).delete("/testing/all-data");
    });

    it("should update confirmation code and expiration", async () => {
        const initialCode = "initial";
        const user = await createUnconfirmedUser({
            emailConfirmation: {
                isConfirmed: false,
                confirmationCode: initialCode,
                expirationDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            },
        });

        await request(app)
            .post("/auth/registration-email-resending")
            .send({email: user.email})
            .expect(HttpStatus.NoContent);

        const updated = await usersCollection.findOne({_id: user._id});
        expect(updated?.emailConfirmation.isConfirmed).toBe(false);
        expect(updated?.emailConfirmation.confirmationCode).not.toBe(initialCode);
        expect(updated?.emailConfirmation.expirationDate).not.toBeNull();
        const expiration = updated?.emailConfirmation.expirationDate
            ? new Date(updated.emailConfirmation.expirationDate).getTime()
            : 0;
        expect(expiration).toBeGreaterThan(Date.now());
    });

    it("should return 400 when email is not found", async () => {
        const res = await request(app)
            .post("/auth/registration-email-resending")
            .send({email: "absent@example.com"})
            .expect(HttpStatus.BadRequest);

        expect(res.body).toEqual({
            errorsMessages: [
                {
                    field: "email",
                    message: "user with this email does not exist",
                },
            ],
        });
    });

    it("should return 400 when email already confirmed", async () => {
        const user = await createUnconfirmedUser({
            emailConfirmation: {
                isConfirmed: true,
                confirmationCode: null,
                expirationDate: null,
            },
        });

        const res = await request(app)
            .post("/auth/registration-email-resending")
            .send({email: user.email})
            .expect(HttpStatus.BadRequest);

        expect(res.body).toEqual({
            errorsMessages: [
                {
                    field: "email",
                    message: "email has already been confirmed",
                },
            ],
        });
    });
});

describe("auth rate limit", () => {
    beforeAll(async () => {
        await runDb();
    });

    afterAll(async () => {
        await closeDb();
    });

    beforeEach(async () => {
        await request(app).delete("/testing/all-data");
    });

    const buildRegistrationPayload = (index: number) => ({
        login: `user-${index}`,
        email: `user-${index}@example.com`,
        password: "password",
    });

    it("should return 429 after more than 5 attempts to the same endpoint", async () => {
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post("/auth/registration")
                .send(buildRegistrationPayload(i))
                .expect(HttpStatus.NoContent);
        }

        await request(app)
            .post("/auth/registration")
            .send(buildRegistrationPayload(5))
            .expect(HttpStatus.TooManyRequests);
    });

    it("should track attempts separately for each endpoint", async () => {
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post("/auth/registration")
                .send(buildRegistrationPayload(i))
                .expect(HttpStatus.NoContent);
        }

        await request(app)
            .post("/auth/registration")
            .send(buildRegistrationPayload(5))
            .expect(HttpStatus.TooManyRequests);

        await request(app)
            .post("/auth/login")
            .send({loginOrEmail: "john@example.com", password: "wrong-password"})
            .expect(HttpStatus.Unauthorized);
    });
});
