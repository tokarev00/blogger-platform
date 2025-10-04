declare module 'bcrypt' {
    export function hash(password: string, saltRounds: number): Promise<string>;
    export function hashSync(password: string, saltRounds: number): string;
    export function compare(password: string, hash: string): Promise<boolean>;
    export function compareSync(password: string, hash: string): boolean;
}
