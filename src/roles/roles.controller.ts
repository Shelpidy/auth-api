import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto,UpdateRoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ICurrentUser } from '../common/interfaces/current-user.interface';
import { TenantContextGuard } from 'src/common/guards/tenant-context.guard';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(AdminGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @UseGuards(TenantContextGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all roles successfully' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':role_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Role found successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' })
  async findOne(@Param('role_id') role_id: string) {
    return this.rolesService.findOne(role_id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED) // 201
  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Role created successfully' })
  async create(@Body() createRoleDto: CreateRoleDto, @CurrentUser() currentUser: ICurrentUser) {
    return this.rolesService.create(createRoleDto, currentUser);
  }

  @Put(':id')
  @HttpCode(HttpStatus.ACCEPTED) // 202
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Role updated successfully' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @CurrentUser() currentUser: ICurrentUser) {
    return this.rolesService.update(id, updateRoleDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION) // 203
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: HttpStatus.NON_AUTHORITATIVE_INFORMATION, description: 'Role deleted successfully' })
  async remove(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.rolesService.remove(id, currentUser);
  }

  @Post('assign')
  @HttpCode(HttpStatus.CREATED) // 201
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Role assigned successfully' })
  async assignRole(
    @Body() assignDto: { user_id: string; role_id: string; tenant_id?: string },
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.rolesService.assignUserToRole({
      ...assignDto,
      currentUser,
    });
  }

  @Delete(':role_id/users/:user_id')
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION) // 203
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Role removed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role assignment not found' })
  async removeUserRole(
    @Param('user_id') user_id: string,
    @Param('role_id') role_id: string,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.rolesService.removeUserRole(user_id, role_id, currentUser);
  }
}
