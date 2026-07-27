import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { LoginDto } from './dto/login-dto';
import { ApiTags } from '@nestjs/swagger';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { seconds, Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectPinoLogger(AuthController.name) private readonly logger: PinoLogger,
  ) {}

  @Post('register-organization')
  @Throttle( { default: { limit: 3, ttl: seconds(60) } })
  async registerOrganization(@Body() dto: RegisterOrganizationDto) {
    this.logger.info(
      { organizationName: dto.organizationName, email: dto.email },
      'Register organization request',
    );
    return this.authService.registerOrganization(dto);
  }

  @Post('login')
  @Throttle( { default: { limit: 5, ttl: seconds(60) } })
  async login(@Body() dto: LoginDto) {
    this.logger.debug({ email: dto.email }, 'Login request');
    return this.authService.login(dto);
  }
}
