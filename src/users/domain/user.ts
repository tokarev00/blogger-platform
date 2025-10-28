export type User = {
    id: string;
    login: string;
    email: string;
    createdAt: string;
};

export type EmailConfirmation = {
    isConfirmed: boolean;
    confirmationCode: string | null;
    expirationDate: string | null;
};

export type UserAccount = User & {
    passwordHash: string;
    emailConfirmation: EmailConfirmation;
};
