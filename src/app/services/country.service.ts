import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.local';
export interface Country {
    id: number;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class CountryService {
    private apiUrl = `${environment.apiUrl}/country`;

    constructor(private http: HttpClient) { }

    getCountries(): Observable<Country[]> {
        return this.http.get<Country[]>(this.apiUrl);
    }

    createCountry(country: Country): Observable<Country> {
        return this.http.post<Country>(this.apiUrl, country);
    }

    deleteCountry(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
