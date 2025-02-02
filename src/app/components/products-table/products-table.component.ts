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
import { ActivatedRoute } from '@angular/router';
import { DiagramComponent } from '../diagram/diagram.component';
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
  categoryId: number | null = null;

  constructor(
    private dialog: MatDialog,
    private productService: ProductService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
      this.productService.getProducts().subscribe((products) => {
        this.dataSource = products;
      });
      this.route.queryParams.subscribe(params => {
        this.categoryId = params['categoryId'] ? +params['categoryId'] : null;
      });
  }

  openAddModal() {
    const dialogRef = this.dialog.open(ProductModalComponent, {
      data: { mode: 'add', categoryId: this.categoryId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshSelection();
      }
    });
  }

  openEditModal(product: Product) {
    const dialogRef = this.dialog.open(ProductModalComponent, {
      data: {
        mode: 'edit',
        product: { ...product },
        categoryId: this.categoryId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshSelection();
      }
    });
  }

  openDiagram() {
    const dialogRef = this.dialog.open(DiagramComponent, {
      data: { products: this.dataSource }
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

  refreshSelection() {
    this.selection.clear(); 
  }

  openDeleteDialog(selectedProducts: any[]) {
    const dialogRef = this.dialog.open(DeleteProductModalComponent, {
      width: '400px',
      data: { products: selectedProducts }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.productService.loadProducts(selectedProducts[0].categoryId);
        this.refreshSelection();
      }
      
    });
  }

}

