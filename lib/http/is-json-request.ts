const JSON_TYPE = /^application\/json\s*(;|$)/i;

/**
 * True when the request declares a JSON body (`application/json`, any case,
 * parameters such as `; charset=utf-8` allowed). Plain HTML forms cannot send
 * this type cross-site without a CORS preflight, so requiring it blocks
 * cross-site form posts to our API routes.
 */
export function isJsonRequest(request: Request): boolean {
  const type = request.headers.get('content-type');
  return type !== null && JSON_TYPE.test(type.trim());
}
