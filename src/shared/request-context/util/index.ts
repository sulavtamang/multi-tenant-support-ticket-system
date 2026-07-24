import { plainToClass } from 'class-transformer';
import { Request } from 'express';

import { UserAccessTokenClaims } from 'src/auth/dto/auth-token-outpu.dto';
import {
  REQUEST_ID_TOKEN_HEADER,
  FORWARDED_FOR_TOKEN_HEADER,
} from 'src/shared/constants';
import { RequestContext } from '../dto/request-context.dto';

export function createRequestContext(request: Request): RequestContext {
  const ctx = new RequestContext();

  ctx.requestID = request.header(REQUEST_ID_TOKEN_HEADER);
  ctx.url = request.url;
  ctx.ip = request.header(FORWARDED_FOR_TOKEN_HEADER)
    ? request.header(FORWARDED_FOR_TOKEN_HEADER)
    : request.ip;

  ctx.user = request.user
    ? plainToClass(UserAccessTokenClaims, request.user, {
        excludeExtraneousValues: true,
      })
    : null;

  // Single source of truth for tenant extraction.
  // Update this line alone if you ever change how organizationId is derived
  // (e.g. from a header, subdomain, or a different JWT claim name).
  ctx.organizationId = request.user ? ((request.user as any).organizationId ?? null): null;

  return ctx;
}
