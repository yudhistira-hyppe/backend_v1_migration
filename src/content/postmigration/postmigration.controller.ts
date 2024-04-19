import { Controller } from '@nestjs/common';
import { PostmigrationService } from './postmigration.service';

@Controller('api/postmigration')
export class PostmigrationController {
  constructor(private readonly PostmigrationService: PostmigrationService) {}
}
