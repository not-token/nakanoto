type GetV1VotesTotalInput = {}

type GetV1VotesTotalResponse = {
    status: "success";
    data: {
        totalVotes: number;
    };
} | {
    status: "error";
    error: {
        message: string;
    };
}

export type Path = "/v1/votes/total"

export type Method = "get" | "post" | "put" | "delete" | "patch"

export type MethodPath = `${Method} ${Path}`

export interface Input extends Record<MethodPath, any> {
    "get /v1/votes/total": GetV1VotesTotalInput;
}

export interface Response extends Record<MethodPath, any> {
    "get /v1/votes/total": GetV1VotesTotalResponse;
}

export const jsonEndpoints = { "get /v1/votes/total": true }

export const endpointTags = { "get /v1/votes/total": [] }

export type Provider = <M extends Method, P extends Path>(method: M, path: P, params: Input[`${M} ${P}`]) => Promise<Response[`${M} ${P}`]>

export type Implementation = (method: Method, path: string, params: Record<string, any>) => Promise<any>

export class ExpressZodAPIClient {
    constructor(protected readonly implementation: Implementation) { }
    public readonly provide: Provider = async (method, path, params) => this.implementation(method, Object.keys(params).reduce((acc, key) => acc.replace(`:${key}`, params[key]), path), Object.keys(params).reduce((acc, key) => path.indexOf(`:${key}`) >= 0 ? acc : { ...acc, [key]: params[key] }, {}));
}

