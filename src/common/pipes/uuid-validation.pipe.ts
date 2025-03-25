import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UUIDValidationPipe implements PipeTransform<string> {
  private UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  transform(value: string): string {
    if (!this.UUID_REGEX.test(value)) {
      throw new BadRequestException(`Invalid UUID format`);
    }
    return value;
  }
}
