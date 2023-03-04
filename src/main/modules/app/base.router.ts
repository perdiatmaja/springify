import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { inject } from "tsyringe";
import Application from "../../application";
import PathMapping from './path_mapping';
import ParameterDescription from './parameter_description';
import getSession from "./get_session";

const MAIN_PATH = "mainPath"
const POST = "POST"
const GET = "GET"
const PUT = "PUT"
const REQUEST_BODY = "REQUEST_BODY"
const USER_SESSION = "USER_SESSION"

abstract class BaseRouter {
    protected readonly application: Application

    constructor(@inject(Application) application: Application) {
        this.application = application
    }

    protected get fastify(): FastifyInstance {
        return this.application.fastify
    }

    initRoute(): void {
        const router: any = this as any
        const pathMappings = router["pathMappings"] as Map<string, PathMapping>
        const mainPath = this.getMainPath()

        pathMappings.forEach((pathMapping: PathMapping, key: string) => {
            const fullPath = mainPath + pathMapping.path!
            switch (pathMapping.type) {
                case POST:
                    this.registerPostRoute(fullPath, async (req) => {
                        return await router[key](req)
                    })
                    break;
                case GET:
                    this.registerGetRoute(fullPath, async (req) => {
                        return await this.invokeMethod(req, key, pathMapping)
                    })
                    break;
                case PUT:
                    this.registerPutRoute(fullPath, async (req) => {
                        return await this.invokeMethod(req, key, pathMapping)
                    })
                    break;
            }
        })
    }

    private async invokeMethod(req: FastifyRequest, key: string, pathMapping: PathMapping) {
        const router = (this as any)
        const method = router[key]
        const params: any[] = []
        const parameterDescriptions: ParameterDescription[] = method.parameterDescriptions ?? []

        for (const parameterDescription of parameterDescriptions) {
            switch (parameterDescription.type) {
                case REQUEST_BODY:
                    params.push(req.body)
                    break
                case USER_SESSION:
                    params.push(await getSession(req))
            }
        }

        return await router[key](...params)
    }

    private getMainPath(): string {
        const router: any = this as any
        return router[MAIN_PATH]
    }

    registerGetRoute<Q>(path: string, onRoute: (request: FastifyRequest<{ Querystring: Q }>) => Promise<void>) {
        this.fastify.get(path, async (request: FastifyRequest<{ Querystring: Q }>, reply: FastifyReply) => {
            try {
                await onRoute(request)
            } catch (error) {
                reply.send(error)
            }
        })
    }

    registerPostRoute<B>(path: string, onRoute: (request: FastifyRequest<{ Body: B }>) => Promise<void> | Promise<any>) {
        this.fastify.post(path, async (request: FastifyRequest<{ Body: B }>, reply: FastifyReply) => {
            try {
                const response = await onRoute(request)
                reply.send(this.sendSuccess(response))
            } catch (error) {
                reply.send(error)
            }
        })
    }

    registerPutRoute<B>(path: string, onRoute: (request: FastifyRequest<{ Body: B }>) => Promise<void>) {
        this.fastify.put(path, async (request: FastifyRequest<{ Body: B }>, reply: FastifyReply) => {
            try {
                await onRoute(request)
            } catch (error) {
                reply.send(error)
            }
        })
    }

    private sendSuccess(data?: any) {
        return {
            code: 1000,
            message: "Success.",
            data: data
        }
    }
}

export default BaseRouter