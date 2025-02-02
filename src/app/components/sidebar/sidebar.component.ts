import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { Category } from '../../models/Category';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeleteCategoryModalComponent } from '../delete-category-modal/delete-category-modal.component';
import { AddCategoryModalComponent } from '../add-category-modal/add-category-modal.component';

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
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const categoryId = params['categoryId'] || 0;
      this.loadCategories(categoryId);
    });
  }

  loadCategories(selectedCategoryId?: string) {
    this.categoryService.getCategoryTree().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        if (selectedCategoryId) {
          this.selectAndExpandNode(this.dataSource.data, selectedCategoryId);
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  selectAndExpandNode(nodes: Category[], categoryId: string) {
    const findNode = (nodes: Category[]): Category | null => {
      for (const node of nodes) {
        if (node.id.toString() === categoryId) {
          return node;
        }
        if (node.children?.length) {
          const found = findNode(node.children);
          if (found) {
            this.treeControl.expand(node);
            return found;
          }
        }
      }
      return null;
    };

    const foundNode = findNode(nodes);
    if (foundNode) {
      this.selectedNode = foundNode;
      
      if (this.hasChild(0, foundNode)) {
        this.treeControl.expand(foundNode);
      }

      this.loadProducts(foundNode);
    }
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

   
    this.router.navigate([], {
      queryParams: { categoryId: node.id },
      queryParamsHandling: 'merge'
    });
    this.loadProducts(node);
    
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
        const currentCategoryId = this.selectedNode?.id;
        this.loadCategories(currentCategoryId?.toString() || '0');
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
        const currentCategoryId = this.selectedNode?.id;
        this.loadCategories(currentCategoryId?.toString() || '0');
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
    const currentParams = { ...this.route.snapshot.queryParams };
    delete currentParams['categoryId'];
    this.router.navigate([], {
      queryParams: currentParams,
      queryParamsHandling: 'merge'
    });

    this.loadCategories();
  }
}