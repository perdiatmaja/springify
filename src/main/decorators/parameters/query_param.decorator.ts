import ParameterDescription from "../../modules/app/parameter_description";

export default function setQueryParamProperty(paramName: string) {
    return function (target: Object, propertyKey: string, parameterIndex: number) {
        const router = (target as any)
        let parameterDescriptions: ParameterDescription[] = router[propertyKey].parameterDescriptions ?? []

        let parameterDescription: ParameterDescription = {}

        if (parameterDescriptions.length > parameterIndex) {
            parameterDescription = parameterDescriptions[parameterIndex] ?? {}
        }

        parameterDescription.type = "QUERY_PARAM"
        parameterDescription.name = paramName

        parameterDescriptions[parameterIndex] = parameterDescription

        router[propertyKey].parameterDescriptions = parameterDescriptions

        return router
    }
}