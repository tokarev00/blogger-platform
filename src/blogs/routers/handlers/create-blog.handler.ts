import {Request, Response} from "express";
import {BlogInputDto} from "../../dto/blog.input-dto";
import {BlogsRepository} from "../../repositories/blogs.repository";
import {Blog} from "../../types/blog";
import {HttpStatus} from "../../../core/types/http-statuses";


export function createBlogHandler(req: Request<{}, {}, BlogInputDto>, res: Response) {
    const newBlogData = {
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl,
    }
    const newBlog: Blog = BlogsRepository.create(newBlogData);
    return res.status(HttpStatus.Created).send(newBlog);
}