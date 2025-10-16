import { Injectable } from '@angular/core';
import { HttpClientService } from '../common/http-client.service';
import { Observable } from 'rxjs';
import { SQL_GENERATOR_URIS } from '../../consts/sys-consts';
import { DatabaseType, TableColumn, DbConnectionRequest, TableColumnsRequest, PromptRequest } from '../../types/sql-generator-type';

@Injectable({
  providedIn: 'root'
})
export class SqlGeneratorService {
  constructor(private httpClientService: HttpClientService) { }

  getDatabaseTypes(): Observable<DatabaseType[]> {
    return this.httpClientService.get<DatabaseType[]>(SQL_GENERATOR_URIS.GET_DB_TYPES);
  }

  getTables(request: DbConnectionRequest): Observable<string[]> {
    return this.httpClientService.post<string[]>(SQL_GENERATOR_URIS.GET_TABLES, request);
  }

  checkDbConnection(request: DbConnectionRequest): Observable<{ status: string; message?: string }> {
    return this.httpClientService.post<{ status: string; message?: string }>(SQL_GENERATOR_URIS.CHECK_DB_CONNECTION, request);
  }

  getTableColumns(request: TableColumnsRequest): Observable<TableColumn[]> {
    return this.httpClientService.post<TableColumn[]>(SQL_GENERATOR_URIS.GET_TABLE_COLUMNS, request);
  }

  generatePrompt(request: PromptRequest): Observable<{ db_info: string; table_info: string }> {
    return this.httpClientService.post<{ db_info: string; table_info: string }>(SQL_GENERATOR_URIS.GET_DB_PROMPTS, request);
  }
}