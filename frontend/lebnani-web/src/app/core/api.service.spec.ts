import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load lesson content blocks', () => {
    service.getLessonContent(4).subscribe(response => {
      expect(response.length).toBe(1);
      expect(response[0].type).toBe('MARKDOWN');
      expect(response[0].content).toContain('mar7aba');
    });

    const request = httpMock.expectOne('/api/lessons/4/content');

    expect(request.request.method).toBe('GET');

    request.flush([
      {
        id: 1,
        type: 'MARKDOWN',
        content: 'En libanais, **mar7aba** veut dire bonjour.',
        displayOrder: 1
      }
    ]);
  });
});