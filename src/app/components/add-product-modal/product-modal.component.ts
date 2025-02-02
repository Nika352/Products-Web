import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { CountryService } from '../../services/country.service';
import { MatIconModule } from '@angular/material/icon';
import { catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

interface ProductDialogData {
  mode: 'add' | 'edit';
  product?: Product
  categoryId?: number;
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
    MatButtonModule,
    MatIconModule
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
export class ProductModalComponent implements OnInit {
  productForm: FormGroup;

  countries: any[] = [];
  isAddingNewCountry = false;
  isEditMode: boolean;

  showNewCountryInput = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ProductDialogData,
    private productService: ProductService,
    private countryService: CountryService
  ) {
    this.isEditMode = data.mode === 'edit';
    this.productForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      countryId: [''],
      newCountry: [''],
      createdAt: ['', Validators.required],
      endDate: ['', Validators.required]
    }, {
      validators: [
        this.countryValidator,
        this.dateValidator
      ]
    });
    
    if (this.isEditMode && data.product) {
      this.productForm.patchValue({
        code: data.product.code,
        name: data.product.name,
        price: data.product.price,
        countryId: data.product.country?.id,
        createdAt: data.product.createdAt,
        endDate: data.product.endDate
      });
    }
  }
 


  private countryValidator(group: AbstractControl): ValidationErrors | null {
    const countryId = group.get('countryId')?.value;
    const newCountry = group.get('newCountry')?.value;

    if (!countryId && !newCountry) {
      return { countryRequired: true };
    }

    return null;
  }

  private dateValidator(group: AbstractControl): ValidationErrors | null {
    const createdAt = group.get('createdAt')?.value;
    const endDate = group.get('endDate')?.value;

    if (createdAt && endDate) {
      const createdAtDate = new Date(createdAt);
      const endDateTime = new Date(endDate);

      if (createdAtDate > endDateTime) {
        return { dateOrder: true };
      }
    }

    return null;
  }

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.countryService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      }
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      
      if (this.showNewCountryInput && this.productForm.get('newCountry')?.value) {
        const newCountryName : string = this.productForm.get('newCountry')?.value;
        this.countryService.createCountry({ name: newCountryName.trim(), id: 0 }).pipe(
          catchError((error) => {
            let country = this.countries.find(c => c.name === newCountryName.trim());
            if (country) {
              return of(country);
            }
            return throwError(() => error);
          })
        ).subscribe({

          next: (newCountry) => {
            const { countryId, newCountry: _, ...otherFormData } = this.productForm.value;
            
            const productData = {
              ...otherFormData,
              countryId: newCountry.id,
              categoryId: this.data.categoryId
            };

            if (this.isEditMode) {
              this.updateProduct(productData);
            } else {
              this.createProduct(productData);
            }
          },
        });
      } else {
        const { newCountry, ...productData } = this.productForm.value;
        
        if (this.isEditMode) {
          this.updateProduct({...productData, categoryId: this.data.categoryId});
        } else {
          this.createProduct({...productData, categoryId: this.data.categoryId});
        }
      }
    } else {
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCountrySelectionChange(event: any) {
    if (event.value === 'new') {
      this.showNewCountryInput = true;
      this.productForm.patchValue({
        countryId: null,
      });
    }
  }

  cancelNewCountry() {
    this.showNewCountryInput = false;
    this.productForm.patchValue({
      countryId: '',
      newCountry: ''
    });
  }

  updateProduct(productData: Product) {
    this.productService.updateProduct({...productData, id: this.data.product?.id}).subscribe({
      next: () => {
        this.dialogRef.close(true);
        this.productService.loadProducts(this.data.categoryId || 0);
      },
    });
  }

  createProduct(productData: Product) {
    this.productService.createProduct(productData).subscribe({
      next: () => {
        this.dialogRef.close(true);
        this.productService.loadProducts(this.data.categoryId || 0);
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  getCountryError(): string {
    if (this.productForm.errors?.['countryRequired']) {
      return 'Please select a country or add a new one';
    }
    return '';
  }

  getDateError(): string {
    if (this.productForm.errors?.['dateOrder']) {
      return 'Created date cannot be after end date';
    }
    return '';
  }
}
