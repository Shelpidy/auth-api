import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserUpdateDto, AssignRoleDto, AssignTenantDto, UserLocationDto, UsersByRoleDto, CreateUserPaymentDto, UpdateUserPaymentDto} from './dto/user.dto';
import { UUIDValidationPipe } from '../common/pipes/uuid-validation.pipe';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users with pagination', description: 'Returns a paginated list of users with metadata.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number of the paginated result (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved users along with pagination metadata.' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.usersService.findAll(page, limit);
  }

  @Get('search')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search users by query', description: 'Searches users by username or email using ILIKE keyword.' })
  @ApiQuery({ name: 'query', required: true, type: String, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Records per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved search results.' })
  async searchUsers(
    @Query('query') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.usersService.searchUsers(query, page, limit);
  }

  @Get(':user_nano_id')
  async findOne(@Param('user_nano_id') user_nano_id: string) {
    return this.usersService.findOne(user_nano_id);
  }

  @Put(':user_nano_id')
  @HttpCode(HttpStatus.ACCEPTED)
  async update(@Param('user_nano_id') user_nano_id: string, @Body() updateDto: UserUpdateDto) {
    return this.usersService.update(user_nano_id, updateDto);
  }

  @Delete(':user_nano_id')
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION)  // 203
  async remove(@Param('user_nano_id') user_nano_id: string) {
    return this.usersService.remove(user_nano_id);
  }

  // Role management
  @Get('roles/:role_nano_id/users')
  @UseGuards(AdminGuard)
  async getUsersByRole(
    @Param('role_nano_id', UUIDValidationPipe) role_nano_id: string,
    @Query() query: UsersByRoleDto
  ) {
    return this.usersService.getUsersByRole(role_nano_id, query.page, query.limit);
  }

  @Get(':user_nano_id/roles')
  async getUserRoles(@Param('user_nano_id') user_nano_id: string) {
    return this.usersService.getUserRoles(user_nano_id);
  }

  @Post(':user_nano_id/roles')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async assignRole(@Param('user_nano_id') user_nano_id: string, @Body() assignRoleDto: AssignRoleDto) {
    return this.usersService.assignRole(user_nano_id, assignRoleDto.role_nano_id);
  }

  @Delete(':user_nano_id/roles/:role_nano_id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION)  // 203
  async removeRole(@Param('user_nano_id') user_nano_id: string, @Param('role_nano_id', UUIDValidationPipe) role_nano_id: string) {
    return this.usersService.removeRole(user_nano_id, role_nano_id);
  }

  // Location management
  @Post(':user_nano_id/locations')
  @HttpCode(HttpStatus.CREATED)
  async addLocation(@Param('user_nano_id') user_nano_id: string, @Body() locationDto: UserLocationDto) {
    return this.usersService.addLocation(user_nano_id, locationDto);
  }

  @Get(':user_nano_id/locations')
  async getLocations(@Param('user_nano_id') user_nano_id: string) {
    return this.usersService.getLocations(user_nano_id);
  }

  @Put(':user_nano_id/locations/:location_nano_id')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateLocation(
    @Param('user_nano_id') user_nano_id: string,
    @Param('location_nano_id', UUIDValidationPipe) location_nano_id: string,
    @Body() locationDto: UserLocationDto
  ) {
    return this.usersService.updateLocation(user_nano_id, location_nano_id, locationDto);
  }

  @Delete(':user_nano_id/locations/:location_nano_id')
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION)  // 203
  async removeLocation(
    @Param('user_nano_id') user_nano_id: string,
    @Param('location_nano_id', UUIDValidationPipe) location_nano_id: string
  ) {
    return this.usersService.removeLocation(user_nano_id, location_nano_id);
  }

  // Tenant management
  @Post(':user_nano_id/tenants')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async assignTenant(@Param('user_nano_id') user_nano_id: string, @Body() assignTenantDto: AssignTenantDto) {
    return this.usersService.assignTenant(user_nano_id, assignTenantDto.tenant_nano_id);
  }

  // Payment endpoints
  @Post(':user_nano_id/payments')
  @HttpCode(HttpStatus.CREATED)
  async createPayment(
    @Param('user_nano_id', UUIDValidationPipe) user_nano_id: string,
    @Body() createDto: CreateUserPaymentDto,
    @Request() req
  ) {
    return this.usersService.createPayment(user_nano_id, createDto, req.user.full_name);
  }

  @Get(':user_nano_id/payments')
  async getUserPayments(
    @Param('user_nano_id', UUIDValidationPipe) user_nano_id: string
  ) {
    return this.usersService.getUserPayments(user_nano_id);
  }

  @Put(':user_nano_id/payments/:payment_nano_id')
  @HttpCode(HttpStatus.ACCEPTED)
  async updatePayment(
    @Param('payment_nano_id', UUIDValidationPipe) payment_nano_id: string,
    @Body() updateDto: UpdateUserPaymentDto,
    @Request() req
  ) {
    return this.usersService.updatePayment(payment_nano_id, updateDto, req.user.full_name);
  }

  // Settings endpoints
//   @Post(':user_nano_id/settings')
//   @HttpCode(HttpStatus.CREATED)
//   async createSetting(
//     @Param('user_nano_id', UUIDValidationPipe) user_nano_id: string,
//     @Body() createDto: CreateUserSettingDto,
//     @Request() req
//   ) {
//     return this.usersService.createSetting(user_nano_id, createDto, req.user.full_name);
//   }

//   @Get(':user_nano_id/settings')
//   async getUserSettings(
//     @Param('user_nano_id', UUIDValidationPipe) user_nano_id: string
//   ) {
//     return this.usersService.getUserSettings(user_nano_id);
//   }

//   @Put(':user_nano_id/settings/:setting_nano_id')
//   @HttpCode(HttpStatus.ACCEPTED)
//   async updateSetting(
//     @Param('setting_nano_id', UUIDValidationPipe) setting_nano_id: string,
//     @Body() updateDto: UpdateUserSettingDto,
//     @Request() req
//   ) {
//     return this.usersService.updateSetting(setting_nano_id, updateDto, req.user.full_name);
//   }
}
