export interface DatabaseType {
  name: string;
  value: string;
}

export interface TableColumn {
  Column_Name: string;
  Comment: string;
}

export interface DbConnectionRequest {
  dbType: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
}

export interface TableColumnsRequest extends DbConnectionRequest {
  tableName: string;
}

export interface PromptRequest extends DbConnectionRequest {
  tableNames: string[];
  operationType: string;
  businessRequirement?: string;
  existingSql?: string;
}