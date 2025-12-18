import { Pipe, PipeTransform, inject } from '@angular/core';
import { PermissionService } from '../../core/permission.service';

@Pipe({
  name: 'maskIncome',
  standalone: true
})
export class MaskIncomePipe implements PipeTransform {
  private permissionService = inject(PermissionService);

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    const hasPermission = this.permissionService.has('CITIZEN:VIEW_SENSITIVE');
    return hasPermission ? value.toString() : '*****';
  }
}
