import {Blog} from "../blogs/types/blog";
import {Post} from "../posts/types/post";

export const db = {
    blogs: <Array<Blog>> [],
    posts: <Array<Post>>[],
    generateFakeObjectId(): string {
        const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');


        const randomPart = [...Array(10)]
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join('');


        const counter = Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, '0');

        return timestamp + randomPart + counter;
    }
};