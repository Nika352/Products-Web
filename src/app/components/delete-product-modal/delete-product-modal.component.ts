import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { forkJoin } from 'rxjs';

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
    @Inject(MAT_DIALOG_DATA) public data: { products: any[] },
    public dialogRef: MatDialogRef<DeleteProductModalComponent>,
    private productService: ProductService
  ) {}

  get productCount(): number {
    return this.data.products.length;
  }

  onDelete() {
    const deleteObservables = this.data.products.map(product => 
      this.productService.deleteProduct(product.id)
    );

    forkJoin(deleteObservables).subscribe({
      next: () => {
        this.dialogRef.close({ success: true });
      },
      error: (error) => {
        console.error('Error deleting products:', error);
        this.dialogRef.close({ success: false });
      }
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
