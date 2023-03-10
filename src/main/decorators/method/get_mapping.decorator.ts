import { GET } from "../../modules/app/http_method"
import { setMethod, setPathMapping } from "./utils"

export default function postMethod(path: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        setMethod(target, propertyKey, descriptor)
        return setPathMapping(path, GET, target, propertyKey)
    }
}