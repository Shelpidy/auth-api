import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UUIDValidationPipe } from '../common/pipes/uuid-validation.pipe';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, AdminGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles', description: 'Retrieves and returns a list of all roles.' })
  @ApiResponse({ status: 200, description: 'List of roles returned successfully.' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':role_nano_id')
  @ApiOperation({ summary: 'Get role by ID', description: 'Retrieves a role by its nano ID.' })
  async findOne(
    @Param('role_nano_id', UUIDValidationPipe) role_nano_id: string,
  ) {
    return this.rolesService.findOne(role_nano_id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoleDto: CreateRoleDto, @Request() req) {
    const creator_full_name = req.user.full_name;
    return this.rolesService.create(createRoleDto, creator_full_name);
  }

  @Patch(':role_nano_id')
  @HttpCode(HttpStatus.ACCEPTED)
  async update(
    @Param('role_nano_id', UUIDValidationPipe) role_nano_id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(role_nano_id, updateRoleDto);
  }

  @Delete(':role_nano_id')
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION)
  async remove(
    @Param('role_nano_id', UUIDValidationPipe) role_nano_id: string,
  ) {
    return this.rolesService.remove(role_nano_id);
  }
}
