import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Category } from '../models/Category';
import { environment } from '../environments/environment.local';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = `${environment.apiUrl}/category`;

    constructor(private http: HttpClient) { }

    getCategoryTree(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.apiUrl}/category-tree`);
    }

    getCategoryById(id: number): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/${id}`);
    }

    createCategory(category: Partial<Category>): Observable<Category> {
        return this.http.post<Category>(this.apiUrl, category);
    }

    updateCategory(category: Partial<Category>): Observable<Category> {
        return this.http.put<Category>(`${this.apiUrl}/${category.id}`, { name: category.name });
    }

    deleteCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
