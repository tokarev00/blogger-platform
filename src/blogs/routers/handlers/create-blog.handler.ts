import {Request, Response} from "express";
import {BlogInputDto} from "../../dto/blog.input-dto";
import {Blog} from "../../types/blog";
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogsService} from "../../application/blogs.service";

export async function createBlogHandler(req: Request<{}, {}, BlogInputDto>, res: Response) {
    const newBlogData = {
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl,
    };
    const newBlog: Blog = await BlogsService.create(newBlogData);
    return res.status(HttpStatus.Created).send(newBlog);
}
