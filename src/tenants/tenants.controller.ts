import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';  // Update this import path
import { CreateTenantDto, UpdateTenantDto, TenantSettingsDto, TenantLocationDto } from './dto/tenant.dto';
import { UUIDValidationPipe } from '../common/pipes/uuid-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @CurrentUser() user: any
  ) {
    return this.tenantsService.create(createTenantDto, user.user_nano_id);
  }

  @Get()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.tenantsService.findAll(page, limit);
  }

  @Get(':tenant_nano_id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('tenant_nano_id') tenant_nano_id: string) {
    return this.tenantsService.findOne(tenant_nano_id);
  }

  @Put(':tenant_nano_id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async update(
    @Param('tenant_nano_id') tenant_nano_id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @CurrentUser() user: any
  ) {
    return this.tenantsService.update(tenant_nano_id, updateTenantDto);
  }


  @Delete(':tenantId')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION)  // 203
  async remove(@Param('tenantId', UUIDValidationPipe) tenantId: string) {
    return this.tenantsService.remove(tenantId);
  }

  @Put(':tenant_nano_id/settings')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async updateSettings(
    @Param('tenant_nano_id') tenant_nano_id: string,
    @Body() settings: TenantSettingsDto
  ) {
    return this.tenantsService.updateSettings(tenant_nano_id, settings);
  }

  @Post(':tenantId/locations')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async addLocation(
    @Param('tenantId', UUIDValidationPipe) tenantId: string,
    @Body() locationDto: TenantLocationDto
  ) {
    return this.tenantsService.addLocation(tenantId, locationDto);
  }

  @Get(':tenantId/locations')
  @HttpCode(HttpStatus.OK)
  async getLocations(@Param('tenantId', UUIDValidationPipe) tenantId: string) {
    return this.tenantsService.getLocations(tenantId);
  }

  @Put(':tenantId/locations/:locationId')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async updateLocation(
    @Param('tenantId', UUIDValidationPipe) tenantId: string,
    @Param('locationId', UUIDValidationPipe) locationId: string,
    @Body() locationDto: TenantLocationDto
  ) {
    return this.tenantsService.updateLocation(tenantId, locationId, locationDto);
  }
}
