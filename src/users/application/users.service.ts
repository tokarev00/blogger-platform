import bcrypt from "bcrypt";
import {buildPaginator} from "../../core/utils/paginator";
import {Paginator} from "../../core/types/pagination";
import {FieldError} from "../../core/types/field-error";
import {User} from "../domain/user";
import {UserInputDto} from "../dto/user.input-dto";
import {UsersQuery} from "../dto/user.query";
import {UsersRepository} from "../repositories/users.repository";

const SALT_ROUNDS = 10;

type UserCreationResult =
    | {status: 'success'; user: User}
    | {status: 'error'; error: FieldError};

export const UsersService = {
    async findAll(query: UsersQuery): Promise<Paginator<User>> {
        const {items, totalCount} = await UsersRepository.findAll(query);
        return buildPaginator(items, totalCount, query.pageNumber, query.pageSize);
    },

    async create(data: UserInputDto): Promise<UserCreationResult> {
        const isLoginTaken = await UsersRepository.isLoginTaken(data.login);
        if (isLoginTaken) {
            return {
                status: 'error',
                error: {field: 'login', message: 'login should be unique'},
            };
        }

        const isEmailTaken = await UsersRepository.isEmailTaken(data.email);
        if (isEmailTaken) {
            return {
                status: 'error',
                error: {field: 'email', message: 'email should be unique'},
            };
        }

        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
        const user = await UsersRepository.create({
            login: data.login,
            email: data.email,
            passwordHash,
        });

        return {status: 'success', user};
    },

    async delete(id: string): Promise<boolean> {
        return UsersRepository.delete(id);
    },
};

export type {UserCreationResult};
