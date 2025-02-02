import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { Product } from '../../models/Product';
import { ProductService } from '../../services/product.service';
interface ProductDialogData {
  mode: 'add' | 'edit';
  product?: Product
}

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    {
      provide: MAT_DATE_FORMATS, useValue: {
        parse: {
          dateInput: 'LL',
        },
        display: {
          dateInput: 'YYYY-MM-DD',
          monthYearLabel: 'YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'YYYY',
        },
      }
    },
    MatDatepickerModule
  ],
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.scss'
})
export class ProductModalComponent {
  productForm: FormGroup;
  countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Japan'];
  isAddingNewCountry = false;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ProductDialogData,
    private productService: ProductService
  ) {
    this.isEditMode = data.mode === 'edit';


    this.productForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      country: ['', Validators.required],
      newCountry: [''],
      timeFrom: ['', Validators.required],
      timeTo: ['', Validators.required]
    });

    if (this.isEditMode && data.product) {
      this.productForm.patchValue({
        code: data.product.code,
        name: data.product.name,
        price: data.product.price,
        country: data.product.country,
        timeFrom: data.product.createdAt,
        timeTo: data.product.endDate
      });
    }
  }

  onSubmit() {
    if (this.productForm.valid) {
      const { newCountry, ...productData } = this.productForm.value;
      
      if (this.isEditMode) {
        
        this.productService.updateProduct(productData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error updating product:', error);
          }
        });
      } else {
       
        this.productService.createProduct(productData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error creating product:', error);
          }
        });
      }
    } else {
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onCountrySelectionChange(value: string) {
    if (value === 'add_new') {
      this.isAddingNewCountry = true;
      this.productForm.get('country')?.setValue('');
    }
  }

  addNewCountry() {
    const newCountry = this.productForm.get('newCountry')?.value;
    if (newCountry && !this.countries.includes(newCountry)) {
      this.countries.push(newCountry);
      this.productForm.patchValue({
        country: newCountry,
        newCountry: ''
      });
      setTimeout(() => {
        this.isAddingNewCountry = false;
      });
    }
  }
}
