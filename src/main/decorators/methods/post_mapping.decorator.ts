import { POST } from "../../modules/app/http_method"
import { setMethod, setPathMapping } from "./method_decorator.utils"

/**
 * Method decorator to register POST method API
 */

export default function postMethod(path: string, roleLevel?: number) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        setMethod(target, propertyKey, descriptor)
        return setPathMapping(path, POST, target, propertyKey, roleLevel)
    }
}