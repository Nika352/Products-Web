import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatHeaderRowDef, MatRowDef, MatTable } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ProductModalComponent } from '../add-product-modal/product-modal.component';
import { Product } from '../../models/Product';
import { DeleteProductModalComponent } from '../delete-product-modal/delete-product-modal.component';
import { ProductService } from '../../services/product.service';
@Component({
  selector: 'app-products-table',
  standalone: true,
  imports: [MatTableModule, MatHeaderRowDef, MatRowDef, MatTable, MatCheckboxModule, MatIconModule, MatButtonModule, MatDialogModule, ProductModalComponent],
  templateUrl: './products-table.component.html',
  styleUrl: './products-table.component.scss'
})
export class ProductsTableComponent implements OnInit {
  displayedColumns: string[] = ['select', 'position', 'name', 'price'];
  selection = new SelectionModel<any>(true, []);
  dataSource: Product[] = [];
  constructor(
    private dialog: MatDialog,
    private productService: ProductService
  ) { }

  ngOnInit() {
    this.productService.currentProducts.subscribe(products => {
      this.dataSource = products;
      // If you're using MatTableDataSource, use this instead:
      // this.dataSource.data = products;
    });
  }

  openAddModal() {
    const dialogRef = this.dialog.open(ProductModalComponent, {
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('New product:', result.product);
      }
    });
  }

  openEditModal(product: Product) {
    const dialogRef = this.dialog.open(ProductModalComponent, {
      data: {
        mode: 'edit',
        product: { ...product }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Updated product:', result.product);
      }
    });
  }


  openDeleteModal(product: any) {
    const dialogRef = this.dialog.open(DeleteProductModalComponent, {
      width: '400px',
      data: { product: product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
 
        const index = this.dataSource.findIndex(item => item.code === product.code);
        if (index > -1) {
          this.dataSource.splice(index, 1);
          this.selection.clear();
        }
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource);
  }
}

