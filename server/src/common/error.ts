
export interface HttpError {
  readonly httpStatusCode: number;
  readonly code: string;
  readonly message?: string;
}

export interface SqlError {
  readonly code: string;
  readonly errno: number;
  readonly sqlState: string;
  readonly sqlMessage: string;
}

export function isHttpError(object: any): object is HttpError {
  return typeof object === "object" && object.httpStatusCode !== undefined;
}

export function httpError({httpStatusCode, code, message}: {
  httpStatusCode?: number, code: string,
  message?: string,
}): HttpError {
  return {code, httpStatusCode: httpStatusCode ?? 400, message};
}

export function isSqlError(object: any): object is SqlError {
  return typeof object === "object" && object.sql !== undefined;
}
