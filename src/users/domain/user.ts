export type User = {
    id: string;
    login: string;
    email: string;
    createdAt: string;
};

export type UserAccount = User & {
    passwordHash: string;
};
