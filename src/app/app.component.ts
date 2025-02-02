import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ProductsTableComponent } from './components/products-table/products-table.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ProductService } from './services/product.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    MatDividerModule,
    ProductsTableComponent,
    SidebarComponent
  ]
})
export class AppComponent {
  sidebarWidth = signal(250);
  isSidebarOpen = signal(true);
  categoryId: number | null = null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['categoryId'] ? +params['categoryId'] : null;
      this.productService.loadProducts(this.categoryId || 0);
    });
  }


  toggleSidebar() {
    if (this.isSidebarOpen()) {
      this.sidebarWidth.set(80); 
    } else {
      this.sidebarWidth.set(250);
    }
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  onMouseDown(event: MouseEvent) {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = this.sidebarWidth();

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      if (newWidth > 60 && newWidth < 500) { 
        this.sidebarWidth.set(newWidth);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}
