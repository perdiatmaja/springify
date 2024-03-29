import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { container } from "tsyringe";
import Application from "../../application";
import { DELETE, GET, HTTP_METHOD, POST, PUT } from "./http_method";
import PathMapping from './path_mapping';
import BaseResponse from "./base_response";
import md5 from "md5";
import { CustFastifyReq } from "../../configs/hook/on_request.hook";

const MAIN_PATH = "mainPath"

abstract class BaseRouter {
    protected readonly application: Application = container.resolve(Application)

    protected get fastify(): FastifyInstance {
        return this.application.fastify
    }

    private initRoute(): void {
        const router: any = this as any
        const pathMappings = router["pathMappings"] as Map<string, PathMapping>
        const mainPath = this.getMainPath()

        pathMappings.forEach((pathMapping: PathMapping, key: string) => {
            const fullPath = mainPath + pathMapping.path!
            const pathMappingType = pathMapping.type as HTTP_METHOD
            switch (pathMappingType) {
                case POST:
                    this.registerPostRoute(fullPath, async (req) => {
                        return await router[key](req)
                    })
                    break;
                case GET:
                    this.registerGetRoute(fullPath, async (req) => {
                        return await router[key](req)
                    })
                    break;
                case PUT:
                    this.registerPutRoute(fullPath, async (req) => {
                        return await router[key](req)
                    })
                    break;
                case DELETE:
                    this.registerDeleteRoute(fullPath, async (req) => {
                        return await router[key](req)
                    })
                    break;
            }

            console.log(`Registered ${pathMappingType} ${fullPath}`)
        })
    }

    private getMainPath(): string {
        const router: any = this as any
        return router[MAIN_PATH]
    }

    private registerGetRoute<Q>(path: string, onRoute: (request: FastifyRequest<{ Querystring: Q }>) => Promise<any>) {
        this.fastify.get(path, async (request: FastifyRequest<{ Querystring: Q }>, reply: FastifyReply) => {
            await this.handleRequest(request, reply, onRoute)
        })
    }

    private registerPostRoute<B>(path: string, onRoute: (request: FastifyRequest<{ Body: B }>) => Promise<void> | Promise<any>) {
        this.fastify.post(path, async (request: FastifyRequest<{ Body: B }>, reply: FastifyReply) => {
            await this.handleRequest(request, reply, onRoute)
        })
    }

    private registerPutRoute<B>(path: string, onRoute: (request: FastifyRequest<{ Body: B }>) => Promise<any>) {
        this.fastify.put(path, async (request: FastifyRequest<{ Body: B }>, reply: FastifyReply) => {
            await this.handleRequest(request, reply, onRoute)
        })
    }

    private registerDeleteRoute<B>(path: string, onRoute: (request: FastifyRequest<{ Body: B }>) => Promise<any>) {
        this.fastify.put(path, async (request: FastifyRequest<{ Body: B }>, reply: FastifyReply) => {
           await this.handleRequest(request, reply, onRoute)
        })
    }

    private async handleRequest(request: FastifyRequest, reply: FastifyReply, onRoute: (request: FastifyRequest<any>) => Promise<any>) {
        try {
            const response = await onRoute(request)
            const requestTime = (request as CustFastifyReq).requestTime
            const requestId = md5(requestTime.toISOString())

            reply.send(this.sendSuccess(requestId, response))
        } catch (error) {
            reply.send(error)
        }
    }

    private sendSuccess<T>(requestId: string, data?: T): BaseResponse<T> {
        return {
            statusCode: 200,
            code: 1000,
            message: "Success.",
            data: data,
            requestId: requestId
        }
    }
}

export default BaseRouter