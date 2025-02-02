import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment.local';
import { Product } from '../models/Product';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}/product`;

    constructor(private http: HttpClient) { }
    private productsSource = new BehaviorSubject<Product[]>([]);
    currentProducts = this.productsSource.asObservable();


    getProduct(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    getProductsByCategory(categoryId: number): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/category/${categoryId}`);
    }

    getProductsByCountry(countryId: number): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/country/${countryId}`);
    }

    createProduct(product: Partial<Product>): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, product);
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
    updateProducts(products: Product[]) {
        this.productsSource.next(products);
    }
}

