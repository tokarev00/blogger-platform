import {Filter, ObjectId} from "mongodb";
import {usersCollection, UserDb} from "../../db/mongo-db";
import {User, UserAccount} from "../domain/user";
import {UsersQuery} from "../dto/user.query";

const mapUser = (user: UserDb): User => ({
    id: user._id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
});

const mapUserAccount = (user: UserDb): UserAccount => ({
    ...mapUser(user),
    passwordHash: user.passwordHash,
});

export const UsersRepository = {
    async findAll({
        searchLoginTerm,
        searchEmailTerm,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize,
    }: UsersQuery): Promise<{items: User[]; totalCount: number}> {
        const searchConditions: Filter<UserDb>[] = [];

        if (searchLoginTerm) {
            searchConditions.push({login: {$regex: searchLoginTerm, $options: 'i'}});
        }

        if (searchEmailTerm) {
            searchConditions.push({email: {$regex: searchEmailTerm, $options: 'i'}});
        }

        const filter: Filter<UserDb> = searchConditions.length === 0
            ? {}
            : searchConditions.length === 1
                ? searchConditions[0]
                : {$or: searchConditions};

        const totalCount = await usersCollection.countDocuments(filter);
        const users = await usersCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return {
            items: users.map(mapUser),
            totalCount,
        };
    },

    async create(data: {login: string; email: string; passwordHash: string}): Promise<User> {
        const newUser: UserDb = {
            _id: new ObjectId(),
            login: data.login,
            email: data.email,
            passwordHash: data.passwordHash,
            createdAt: new Date().toISOString(),
        };

        await usersCollection.insertOne(newUser);
        return mapUser(newUser);
    },

    async delete(id: string): Promise<boolean> {
        const result = await usersCollection.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount === 1;
    },

    async isLoginTaken(login: string): Promise<boolean> {
        const user = await usersCollection.findOne({login});
        return Boolean(user);
    },

    async isEmailTaken(email: string): Promise<boolean> {
        const user = await usersCollection.findOne({email});
        return Boolean(user);
    },

    async findAccountByLoginOrEmail(loginOrEmail: string): Promise<UserAccount | null> {
        const userByLogin = await usersCollection.findOne({login: loginOrEmail});
        if (userByLogin) {
            return mapUserAccount(userByLogin);
        }

        const userByEmail = await usersCollection.findOne({email: loginOrEmail});
        return userByEmail ? mapUserAccount(userByEmail) : null;
    },

    async findById(id: string): Promise<User | null> {
        const user = await usersCollection.findOne({_id: new ObjectId(id)});
        return user ? mapUser(user) : null;
    },
};
