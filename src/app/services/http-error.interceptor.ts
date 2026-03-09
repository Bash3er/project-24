import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client Error: ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 400: errorMessage = 'Bad Request'; break;
            case 401: errorMessage = 'Unauthorized. Please log in.'; break;
            case 403: errorMessage = 'Forbidden. Access denied.'; break;
            case 404: errorMessage = 'Resource not found.'; break;
            case 500: errorMessage = 'Internal Server Error.'; break;
            default: errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
        }
        console.error('HTTP Interceptor caught error:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
