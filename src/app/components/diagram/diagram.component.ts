import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Product } from '../../models/Product';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  providers: [
    provideNativeDateAdapter()
  ]
})
export class DiagramComponent implements OnInit {
  products: Product[] = [];
  dateColumns: Date[] = [];
  displayedColumns: string[] = ['name'];
  selectedDate: Date;
  dataSource: MatTableDataSource<Product>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { products: Product[] }, private cdr: ChangeDetectorRef) {
    this.products = data.products;
    this.dataSource = new MatTableDataSource(this.products);

    const earliestDate = this.findEarliestDate();
    this.selectedDate = earliestDate;
  }

  private findEarliestDate(): Date {
    if (!this.products.length) return new Date();

    let earliestDate = new Date(this.products[0].createdAt!);

    this.products.forEach(product => {
      const createdAt = new Date(product.createdAt!);
      if (createdAt < earliestDate) {
        earliestDate = createdAt;
      }
    });

    return earliestDate;
  }

  ngOnInit() {
    this.generateDateColumns();
  }

  onDateSelected(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      this.selectedDate = event.value;
      this.generateDateColumns();
      this.dataSource = new MatTableDataSource(this.products);
      this.cdr.detectChanges();
    }
  }

  private generateDateColumns() {
    const weekStart = this.getMonday(this.selectedDate);
    const weekEnd = this.getSunday(this.selectedDate);

    this.dateColumns = [];
    let currentDate = new Date(weekStart);

    this.displayedColumns = ['name'];

    let columnIndex = 0;
    while (currentDate <= weekEnd) {
      this.dateColumns.push(new Date(currentDate));
      this.displayedColumns.push(`date_${columnIndex}`);
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      columnIndex++;
    }

    this.dataSource = new MatTableDataSource(this.products);

    this.cdr.detectChanges();
  }

  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  private getSunday(date: Date): Date {
    const monday = this.getMonday(date);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    return sunday;
  }

  getProductStatus(product: Product, columnIndex: number): string {
    if (!product.createdAt || !product.endDate || columnIndex < 0 || !this.dateColumns[columnIndex]) {
      return '';
    }

    const checkDate = new Date(this.dateColumns[columnIndex]);
    const startDate = new Date(product.createdAt);
    const endDate = new Date(product.endDate);

    checkDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (checkDate > endDate) {
      return 'expired-period';
    } else if (checkDate >= startDate && checkDate <= endDate) {
      return 'valid-period';
    }
    return '';
  }

  getColumnDate(columnIndex: number): string {
    if (columnIndex === 0) return 'Product Name';
    const date = this.dateColumns[columnIndex - 1];
    return this.formatDate(date);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  nextWeek() {
    const nextWeek = new Date(this.selectedDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    this.selectedDate = nextWeek;
    this.generateDateColumns();
    this.dataSource = new MatTableDataSource(this.products);
    this.cdr.detectChanges();
  }

  previousWeek() {
    const prevWeek = new Date(this.selectedDate);
    prevWeek.setDate(prevWeek.getDate() - 7);
    this.selectedDate = prevWeek;
    this.generateDateColumns();
    this.dataSource = new MatTableDataSource(this.products);
    this.cdr.detectChanges();
  }
}