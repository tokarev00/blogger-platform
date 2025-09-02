import {Blog} from "../types/blog";
import {db} from "../../db/in-memory.db";

export const BlogsRepository = {
    findAll() : Array<Blog> {
        return db.blogs;
    },
    findById (id: string): Blog | null {
        const blog = db.blogs.find((b) => b.id === id);
        if (!blog) {
            return null;
        }
        return blog;
    },
    create (blog: Omit<Blog, 'id'>): Blog {
        const newBlog: Blog = {...blog, id: db.generateFakeObjectId()};
        db.blogs.push(newBlog);
        return newBlog;
    },
    update (id: string, updatedBlog: Omit<Blog, 'id'>): void {
        const blog = this.findById(id);
        if (!blog) {
            throw new Error('Blog not exists');
        }
        blog.name = updatedBlog.name;
        blog.description = updatedBlog.description;
        blog.websiteUrl = updatedBlog.websiteUrl;
        return;
    },
    delete (id: string): void {
        const blogIndex = db.blogs.findIndex((b) => b.id === id);
        if (blogIndex === -1) {
            throw new Error('Blog not exists');
        }
        db.blogs.splice(blogIndex, 1)
    }
}