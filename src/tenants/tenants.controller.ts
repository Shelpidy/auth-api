import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard'; // Update this import path
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantSettingsDto,
  TenantLocationDto,
  CreateTenantSubscriptionDto,
  UpdateTenantSubscriptionDto,
} from './dto/tenant.dto';
import { UUIDValidationPipe } from '../common/pipes/uuid-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, AdminGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tenant', description: 'Creates a tenant record and returns the new tenant.' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully.' })
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @CurrentUser() user: any,
  ) {
    return this.tenantsService.create(createTenantDto, user.user_nano_id);
  }

  @Get()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tenants with pagination', description: 'Returns paginated tenants with metadata.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Records per page (default: 10)' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
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
    @CurrentUser() user: any,
  ) {
    return this.tenantsService.update(tenant_nano_id, updateTenantDto);
  }

  @Delete(':tenant_nano_id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION) // 203
  async remove(@Param('tenant_nano_id', UUIDValidationPipe) tenantId: string) {
    return this.tenantsService.remove(tenantId);
  }

  @Put(':tenant_nano_id/settings')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async updateSettings(
    @Param('tenant_nano_id') tenant_nano_id: string,
    @Body() settings: TenantSettingsDto,
  ) {
    return this.tenantsService.updateSettings(tenant_nano_id, settings);
  }

  @Post(':tenantId/locations')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async addLocation(
    @Param('tenantId', UUIDValidationPipe) tenantId: string,
    @Body() locationDto: TenantLocationDto,
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
    @Body() locationDto: TenantLocationDto,
  ) {
    return this.tenantsService.updateLocation(
      tenantId,
      locationId,
      locationDto,
    );
  }

  // Subscription endpoints
  @Post(':tenant_nano_id/subscriptions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a subscription for a tenant', description: 'Creates a new subscription record for the specified tenant.' })
  @ApiBody({ type: CreateTenantSubscriptionDto, description: 'Subscription details' })
  async createSubscription(
    @Param('tenant_nano_id', UUIDValidationPipe) tenant_nano_id: string,
    @Body() createDto: CreateTenantSubscriptionDto,
    @Request() req,
  ) {
    return this.tenantsService.createSubscription(
      tenant_nano_id,
      createDto,
      req.user.full_name,
    );
  }

  @Get(':tenant_nano_id/subscriptions')
  async getSubscriptions(
    @Param('tenant_nano_id', UUIDValidationPipe) tenant_nano_id: string,
  ) {
    return this.tenantsService.getSubscriptions(tenant_nano_id);
  }

  @Put(':tenant_nano_id/subscriptions/:subscription_nano_id')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateSubscription(
    @Param('subscription_nano_id', UUIDValidationPipe)
    subscription_nano_id: string,
    @Body() updateDto: UpdateTenantSubscriptionDto,
    @Request() req,
  ) {
    return this.tenantsService.updateSubscription(
      subscription_nano_id,
      updateDto,
      req.user.full_name,
    );
  }
}
