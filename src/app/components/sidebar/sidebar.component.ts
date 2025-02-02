import { Component, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Category } from '../../models/Category';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeleteCategoryModalComponent } from '../delete-category-modal/delete-category-modal.component';
import { AddCategoryModalComponent } from '../add-category-modal/add-category-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  treeControl = new NestedTreeControl<Category>(node => node.children);
  dataSource = new MatTreeNestedDataSource<Category>();
  selectedNode: Category | null = null;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategoryTree().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  hasChild = (_: number, node: Category) => !!node.children && node.children.length > 0;

  onNodeSelect(node: Category, event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'MAT-ICON') {
      event.stopPropagation();
      this.treeControl.toggle(node);
      return;
    }

    this.selectedNode = node;

    if (!this.hasChild(0, node)) {
      this.router.navigate([], {
        queryParams: { categoryId: node.id },
        queryParamsHandling: 'merge'
      });
    }
  }

  loadProducts(node: Category) {
    this.productService.getProductsByCategory(node.id).subscribe({
      next: (products) => {
        this.productService.updateProducts(products);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  addCategory() {
    const dialogRef = this.dialog.open(AddCategoryModalComponent, {
      width: '400px',
      data: {
        parentCategory: this.selectedNode || null,
        isEdit: false,
        isRoot: !this.selectedNode
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
        this.refreshSelection();
      }
    });
  }

  editCategory() {
    if (!this.selectedNode) return;
    const dialogRef = this.dialog.open(AddCategoryModalComponent, {
      width: '400px',
      data: {
        editCategory: this.selectedNode,
        isEdit: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
        this.refreshSelection();
      }
    });
  }

  deleteCategory() {
    if (!this.selectedNode || !this.selectedNode.id) return;

    const dialogRef = this.dialog.open(DeleteCategoryModalComponent, {
      width: '400px',
      data: {
        category: this.selectedNode
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true && this.selectedNode?.id) {
        this.categoryService.deleteCategory(this.selectedNode.id).subscribe({
          next: () => {
            this.loadCategories();
            this.refreshSelection();
          }
        });
      }
    });
  }

  isSelected(node: Category): boolean {
    return this.selectedNode?.id === node.id;
  }

  refreshSelection() {
    this.selectedNode = null;
    this.router.navigate([], {
      queryParams: { categoryId: null },
      queryParamsHandling: 'merge'
    });
  }

  onCategorySelect(category: any) {
    this.router.navigate([], {
      queryParams: { categoryId: category.id },
      queryParamsHandling: 'merge'
    });
  }
}
