import { Expose } from 'class-transformer';

export class UserAccessTokenClaims {
  @Expose()
  agentId!: string;

  @Expose()
  organizationId!: string;

  @Expose()
  role!: string;
}
