import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Query, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateUserDto, UserUpdateDto, CreateUserTypeDto, UpdateUserTypeDto } from './dto/user.dto';
import { ICurrentUser } from '../common/interfaces/current-user.interface';
import { TenantContextGuard } from 'src/common/guards/tenant-context.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, TenantContextGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED) // 201
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.usersService.createUser(createUserDto, currentUser);
  }

  @Get()
  @UseGuards(AdminGuard,TenantContextGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users retrieved successfully' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.usersService.findAll(page, limit);
  }

  @Get(':user_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User found successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async findOne(@Param('user_id') user_id: string) {
    return this.usersService.findOne(user_id);
  }


  @Put(':user_id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED) // 202
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User updated successfully' })
  async update(
    @Param('user_id') user_id: string, 
    @Body() updateDto: UserUpdateDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.usersService.update(user_id, updateDto, currentUser);
  }

  @Delete(':user_id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION) // 203
  async remove(
    @Param('user_id') user_id: string,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.usersService.remove(user_id, currentUser);
  }

  @Get(':user_id/payments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserPayments(@Param('user_id') user_id: string) {
    return this.usersService.getUserPayments(user_id);
  }

  @Get(':user_id/roles')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserRoles(@Param('user_id') user_id: string) {
    return this.usersService.getUserRoles(user_id);
  }

  @Post('types')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user type' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User type created successfully' })
  async createUserType(
    @Body() createUserTypeDto: CreateUserTypeDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.usersService.createUserType(createUserTypeDto, currentUser);
  }

  @Get('types')
  @UseGuards(AdminGuard,TenantContextGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all user types' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User types retrieved successfully' })
  async getUserTypes(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.usersService.getUserTypes(page, limit);
  }

  @Get('types/:type_id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user type by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User type found' })
  async getUserType(@Param('type_id') type_id: string) {
    return this.usersService.getUserType(type_id);
  }

  @Put('types/:type_id')
  @HttpCode(HttpStatus.ACCEPTED) // 202
  @ApiOperation({ summary: 'Update user type' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'User type updated successfully' })
  async updateUserType(
    @Param('type_id') type_id: string,
    @Body() updateUserTypeDto: UpdateUserTypeDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.usersService.updateUserType(type_id, updateUserTypeDto, currentUser);
  }

  @Delete('types/:type_id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION) // 203
  @ApiOperation({ summary: 'Delete user type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User type deleted successfully' })
  async deleteUserType(
    @Param('type_id') type_id: string,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.usersService.deleteUserType(type_id, currentUser);
  }

  @Get('by-type')
  @UseGuards(AdminGuard,TenantContextGuard)
  @ApiOperation({ summary: 'Get users by user type ID' })
  @ApiQuery({ name: 'userTypeId', required: true })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Returns users of the specified type'
  })
  async getUsersByType(
    @Query('userTypeId') userTypeId: string,
  ) {
    return this.usersService.findByUserType(userTypeId);
  }

  @Get('by-role')
  @UseGuards(AdminGuard, TenantContextGuard)
  @ApiOperation({ summary: 'Get users by role name' })
  @ApiQuery({ name: 'roleName', required: true })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Returns users with the specified role'
  })
  async getUsersByRole(
    @Query('roleName') roleName: string,
  ) {
    return this.usersService.findByRole(roleName);
  }
}
