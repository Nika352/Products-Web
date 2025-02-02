import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Category } from '../../models/Category';
import { CategoryService } from '../../services/category.service';
export interface CategoryModalData {
  parentCategory?: Category;
  editCategory?: Category;
  isEdit: boolean;
}

@Component({
  selector: 'app-add-category-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-category-modal.component.html',
  styleUrls: ['./add-category-modal.component.scss']
})
export class AddCategoryModalComponent {
  categoryForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<AddCategoryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CategoryModalData,
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required]
    });

    if (data.isEdit && data.editCategory) {
      this.categoryForm.patchValue({
        name: data.editCategory.name
      });
    }
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      const category = this.categoryForm.value;

      if (this.data.isEdit && this.data.editCategory) {
        category.id = this.data.editCategory.id;
        this.categoryService.updateCategory(category).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error updating category:', error);
          }
        });
      } else {
        if (this.data.parentCategory) {
          category.parentId = this.data.parentCategory.id;
        }
        this.categoryService.createCategory(category).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error creating category:', error);
          }
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}