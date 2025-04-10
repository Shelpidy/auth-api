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
  Patch,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateTenantDto,
  UpdateTenantDto,
  CreateEmailSettingsDto,
  CreateSmsSettingsDto,
  CreateContactDto,
  UpdateSmsSettingsDto,
  UpdateEmailSettingsDto,
  CreateTenantSettingsDto,
  UpdateTenantSettingsDto
} from './dto/tenant.dto';
import { ICurrentUser } from '../common/interfaces/current-user.interface';
import { SuperAdminGuard } from 'src/auth/guards/super-admin.guard';

@ApiTags('Tenants')
@Controller('tenants')

export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.CREATED) // 201
  @ApiResponse({ 
    status: HttpStatus.CREATED,
    description: 'Tenant created successfully',
    schema: {
      properties: {
        message: { type: 'string' },
        data: { type: 'object' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Tenant already exists',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async createTenant(
    @Body() dto: CreateTenantDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.createTenant(dto, currentUser);
  }


  @Get()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Tenants retrieved successfully',
    schema: {
      properties: {
        data: { type: 'array', items: { type: 'object' } }
      }
    }
  })
  async getAllTenants(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.tenantsService.getAllTenants(page, limit);
  }

  @Get(':tenant_id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Tenant retrieved successfully',
    schema: {
      properties: {
        data: { type: 'object' }
      }
    }
  })

  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Tenant not found',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async getTenant(@Param('tenant_id') tenant_id: string) {
    return this.tenantsService.getTenant(tenant_id);
  }

  @Put(':tenant_id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.ACCEPTED) // 202
  @ApiResponse({ 
    status: HttpStatus.ACCEPTED,
    description: 'Tenant updated successfully',
    schema: {
      properties: {
        message: { type: 'string' },
        data: { type: 'object' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Tenant not found',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async updateTenant(
    @Param('tenant_id') tenant_id: string,
    @Body() dto: UpdateTenantDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.updateTenant(tenant_id, dto, currentUser);
  }

  @Delete(':tenant_id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION) // 203
  @ApiResponse({ 
    status: HttpStatus.NON_AUTHORITATIVE_INFORMATION,
    description: 'Tenant deleted successfully',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Tenant not found',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async deleteTenant(
    @Param('tenant_id') tenant_id: string,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.deleteTenant(tenant_id, currentUser);
  }

  // Contact endpoints
  @Post(':tenant_id/contacts')
  @ApiOperation({ summary: 'Create tenant contact' })
  @ApiResponse({ 
    status: HttpStatus.CREATED,
    description: 'Contact created successfully',
    schema: {
      properties: {
        message: { type: 'string' },
        data: { type: 'object' }
      }
    }
  })
  async createContact(
    @Param('tenant_id') tenant_id: string,
    @Body() dto: CreateContactDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.createContact(tenant_id, dto, currentUser);
  }

  @Put(':tenant_id/contacts/:contact_id')
  @HttpCode(HttpStatus.ACCEPTED) // 202
  @ApiOperation({ summary: 'Update tenant contact' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Contact updated successfully',
    schema: {
      properties: {
        message: { type: 'string' },
        data: { type: 'object' }
      }
    }
  })
  async updateContact(
    @Param('tenant_id') tenant_id: string,
    @Param('contact_id') contact_id: string,
    @Body() dto: CreateContactDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.updateContact(
      tenant_id,
      contact_id,
      dto,
      currentUser
    );
  }

  @Get('contacts/:contact_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get tenant contact by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Contact retrieved successfully',
    schema: {
      properties: {
        data: { type: 'object' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Contact not found',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async getContact(@Param('contact_id') contact_id: string) {
    return this.tenantsService.getContact(contact_id);
  }

  @Delete(':tenant_id/contacts/:contact_id')
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION) // 203
  @ApiOperation({ summary: 'Delete tenant contact' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Contact deleted successfully',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Contact not found',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async deleteContact(
    @Param('contact_id') contact_id: string,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.deleteContact(contact_id, currentUser);
  }

  // Email settings endpoints
  @Post(':tenant_id/email-settings')
  @ApiOperation({ summary: 'Create email settings for tenant' })
  @ApiResponse({ 
    status: HttpStatus.CREATED,
    description: 'Email settings created successfully',
    schema: {
      properties: {
        message: { type: 'string' },
        data: { type: 'object' }
      }
    }
  })
  async createEmailSettings(
    @Param('tenant_id') tenant_id: string,
    @Body() dto: CreateEmailSettingsDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.createEmailSettings(tenant_id, dto, currentUser);
  }

  @Get(':tenant_id/email-settings')
  @ApiOperation({ summary: 'Get email settings for tenant' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Email settings retrieved successfully',
    schema: {
      properties: {
        data: { type: 'object' }
      }
    }
  })
  async getEmailSettings(@Param('tenant_id') tenant_id: string) {
    return this.tenantsService.getEmailSettings(tenant_id);
  }

  @Put(':tenant_id/email-settings')
  @HttpCode(HttpStatus.ACCEPTED) // 202
  @ApiOperation({ summary: 'Update email settings for tenant' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Email settings updated successfully',
    schema: {
      properties: {
        message: { type: 'string' },
        data: { type: 'object' }
      }
    }
  })
  async updateEmailSettings(
    @Param('tenant_id') tenant_id: string,
    @Body() dto: UpdateEmailSettingsDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.updateEmailSettings(tenant_id, dto, currentUser);
  }

  @Delete(':tenant_id/email-settings')
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION) // 203
  @ApiOperation({ summary: 'Delete email settings for tenant' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Email settings deleted successfully',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Email settings not found',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async deleteEmailSettings(
    @Param('tenant_id') tenant_id: string,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.deleteEmailSettings(tenant_id, currentUser);
  }

  // SMS settings endpoints  
  @Post(':tenant_id/sms-settings')
  @ApiOperation({ summary: 'Create SMS settings for tenant' })
  @ApiResponse({ 
    status: HttpStatus.CREATED,
    description: 'SMS settings created successfully',
    schema: {
      properties: {
        message: { type: 'string' },
        data: { type: 'object' }
      }
    }
  })
  async createSmsSettings(
    @Param('tenant_id') tenant_id: string,
    @Body() dto: CreateSmsSettingsDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.createSmsSettings(tenant_id, dto, currentUser);
  }

  @Get(':tenant_id/sms-settings')
  @ApiOperation({ summary: 'Get SMS settings for tenant' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'SMS settings retrieved successfully',
    schema: {
      properties: {
        data: { type: 'object' }
      }
    }
  })
  async getSmsSettings(@Param('tenant_id') tenant_id: string) {
    return this.tenantsService.getSmsSettings(tenant_id);
  }

  @Put(':tenant_id/sms-settings')
  @HttpCode(HttpStatus.ACCEPTED) // 202
  @ApiOperation({ summary: 'Update SMS settings for tenant' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'SMS settings updated successfully',
    schema: {
      properties: {
        message: { type: 'string' },
        data: { type: 'object' }
      }
    }
  })
  async updateSmsSettings(
    @Param('tenant_id') tenant_id: string,
    @Body() dto: UpdateSmsSettingsDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.updateSmsSettings(tenant_id, dto, currentUser);
  }

  @Delete(':tenant_id/sms-settings')
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION) // 203
  @ApiOperation({ summary: 'Delete SMS settings for tenant' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'SMS settings deleted successfully',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'SMS settings not found',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async deleteSmsSettings(
    @Param('tenant_id') tenant_id: string,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.deleteSmsSettings(tenant_id, currentUser);
  }

  // Tenant settings endpoints
  @Post(':tenant_id/settings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create tenant settings' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tenant settings created successfully',
    schema: {
      properties: {
        message: { type: 'string' },
        data: { type: 'object' }
      }
    }
  })
  async createTenantSettings(
    @Param('tenant_id') tenant_id: string,
    @Body() dto: CreateTenantSettingsDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    dto.tenant_id = tenant_id;
    return this.tenantsService.createTenantSettings(dto, currentUser);
  }

  @Get(':tenant_id/settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get tenant settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tenant settings retrieved successfully'
  })
  async getTenantSettings(@Param('tenant_id') tenant_id: string) {
    return this.tenantsService.getTenantSettings(tenant_id);
  }

  @Put(':tenant_id/settings')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Update tenant settings' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Tenant settings updated successfully',
    schema: {
      properties: {
        message: { type: 'string' },
        data: { type: 'object' }
      }
    }
  })
  async updateTenantSettings(
    @Param('tenant_id') tenant_id: string,
    @Body() dto: UpdateTenantSettingsDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.updateTenantSettings(tenant_id, dto, currentUser);
  }

  @Delete(':tenant_id/settings')
  @HttpCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION)
  @ApiOperation({ summary: 'Delete tenant settings' })
  @ApiResponse({
    status: HttpStatus.NON_AUTHORITATIVE_INFORMATION,
    description: 'Tenant settings deleted successfully',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async deleteTenantSettings(
    @Param('tenant_id') tenant_id: string,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.deleteTenantSettings(tenant_id, currentUser);
  }

  // Status update endpoints
  @Patch(':tenant_id/status')
  @HttpCode(HttpStatus.ACCEPTED) // 202
  @ApiOperation({ summary: 'Update tenant status' })
  @ApiResponse({ 
    status: HttpStatus.ACCEPTED,
    description: 'Tenant status updated successfully',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async updateTenantStatus(
    @Param('tenant_id') tenant_id: string,
    @Body('status') status: boolean,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.updateTenantStatus(tenant_id, status, currentUser);
  }

  @Patch(':tenant_id/suspension')
  @HttpCode(HttpStatus.ACCEPTED) // 202
  @ApiOperation({ summary: 'Update tenant suspension status' })
  @ApiResponse({ 
    status: HttpStatus.ACCEPTED,
    description: 'Tenant suspension status updated successfully',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async updateTenantSuspension(
    @Param('tenant_id') tenant_id: string,
    @Body('suspended') suspended: boolean,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.tenantsService.updateTenantSuspension(tenant_id, suspended, currentUser);
  }

  @Get('domain/:domain')
  findByDomain(@Param('domain') domain: string) {
    return this.tenantsService.findByDomain(domain);
  }

  @Post(':tenant_id/welcome-email')
  @HttpCode(HttpStatus.CREATED) // 201
  sendWelcomeEmail(@Param('tenant_id') tenant_id: string) {
    return this.tenantsService.sendWelcomeEmail(tenant_id);
  }
}
