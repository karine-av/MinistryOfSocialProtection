import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface DialogData {
  readonly rows: readonly unknown[];
  readonly displayedColumns: readonly string[];
}

@Component({
  standalone: true,
  selector: 'app-financial-liability-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './financial-liability-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancialLiabilityDialogComponent {
  readonly dataSource: MatTableDataSource<unknown>;
  readonly displayedColumns: readonly string[];



  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: DialogData,
    private readonly dialogRef: MatDialogRef<FinancialLiabilityDialogComponent>
  ) {
    this.dataSource = new MatTableDataSource([...data.rows]);
    this.displayedColumns = data.displayedColumns;
  }


  close(): void {
    this.dialogRef.close();
  }


}
