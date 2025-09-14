import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogsService} from "../../application/blogs.service";

export async function getBlogListHandler(req: Request, res: Response) {
    const blogs = await BlogsService.findAll();
    return res.status(HttpStatus.Ok).send(blogs);
}
