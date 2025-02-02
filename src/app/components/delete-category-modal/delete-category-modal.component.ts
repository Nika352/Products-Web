import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
@Component({
  selector: 'app-delete-category-modal',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './delete-category-modal.component.html',
  styleUrls: ['./delete-category-modal.component.scss']
})
export class DeleteCategoryModalComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteCategoryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
