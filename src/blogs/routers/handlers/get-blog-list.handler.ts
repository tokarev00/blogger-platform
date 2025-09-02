import {Request, Response} from "express";
import {BlogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";

export function getBlogListHandler(req: Request, res: Response) {
    const blogs = BlogsRepository.findAll();
    return res.status(HttpStatus.Ok).send(blogs);
}