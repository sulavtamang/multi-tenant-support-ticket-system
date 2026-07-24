import { UserAccessTokenClaims } from 'src/auth/dto/auth-token-outpu.dto';

export class RequestContext {
  public requestID: string | undefined;

  public url!: string;

  public ip!: string | undefined;

  public user!: UserAccessTokenClaims | null;

  public organizationId!: string;
}
