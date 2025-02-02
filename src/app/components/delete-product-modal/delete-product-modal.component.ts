import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-product-modal',
  standalone: true,
  imports: [CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule],
  templateUrl: './delete-product-modal.component.html',
  styleUrl: './delete-product-modal.component.scss'
})
export class DeleteProductModalComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteProductModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: any }
  ) { }

  onDelete() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
