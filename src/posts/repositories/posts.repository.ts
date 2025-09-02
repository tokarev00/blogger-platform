import {db} from "../../db/in-memory.db";
import {Post} from "../types/post";

export const PostsRepository = {
    findAll() : Array<Post> {
        return db.posts;
    },
    findById (id: string): Post | null {
        const post = db.posts.find((p) => p.id === id);
        if (!post) {
            return null;
        }
        return post;
    },
    create (post: Omit<Post, 'id'>): Post {
        const newPost: Post = {...post, id: db.generateFakeObjectId()};
        db.posts.push(newPost);
        return newPost;
    },
    update (id: string, updatedPost: Omit<Post, 'id'>): void {
        const post = this.findById(id);
        if (!post) {
            throw new Error('Post not exists');
        }
        post.title = updatedPost.title;
        post.shortDescription = updatedPost.shortDescription;
        post.content = updatedPost.content;
        post.blogId = updatedPost.blogId;
        post.blogName = updatedPost.blogName;
        return;
    },
    delete (id: string): void {
        const postIndex = db.posts.findIndex(p => p.id === id);
        if (postIndex === -1) {
            throw new Error('Post not exists');
        }
        db.posts.splice(postIndex, 1);
    }
}