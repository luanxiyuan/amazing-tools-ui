import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MODULE_TITLES } from '../../consts/sys-consts';
import { FaviconService } from '../../services/common/favicon.service';
import { SqlGeneratorService } from '../../services/sql-generator/sql-generator.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-sql-generator',
  templateUrl: './sql-generator.component.html',
  styleUrls: ['./sql-generator.component.css']
})
export class SqlGeneratorComponent {
  dbConnectionForm: FormGroup;
  queryRequirementForm: FormGroup;
  generatedPrompt: string = '';
  databaseTypes: any[] = [];
  tableOptions: string[] = [];
  isConnectionLoading: boolean = false;
  isGenerating: boolean = false;
  isTableLoading: boolean = false;
  
  // Define options for the operation type segmented control
  operationTypeOptions = [
    { label: 'Query', value: 'query' },
    { label: 'Optimize', value: 'optimize' }
  ];

  // Default ports for different database types
  private defaultPorts: { [key: string]: string } = {
    'mysql': '3306',
    'postgresql': '5432',
    'oracle': '1521',
    'sqlserver': '1433',
    'mongodb': '27017'
  };

  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private faviconService: FaviconService,
    private sqlGeneratorService: SqlGeneratorService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.setTitle(MODULE_TITLES.SQL_GENERATOR || 'SQL Generator');
    this.faviconService.setFavicon('assets/favicons/sql-generator-favicon.ico');
    
    this.dbConnectionForm = this.fb.group({
      dbType: ['mysql', [Validators.required]],
      host: ['localhost', [Validators.required]], // Default to localhost
      port: ['3306', [Validators.required]],
      database: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
    
    this.queryRequirementForm = this.fb.group({
      tables: this.fb.array([this.fb.control('')]),
      operationType: ['query'], // New field for operation type, default to 'query'
      businessRequirement: ['', [Validators.required]],
      existingSql: [''] // New field for existing SQL
    });

    // Subscribe to operationType changes to handle conditional validation and UI updates
    this.queryRequirementForm.get('operationType')?.valueChanges.subscribe(value => {
      this.handleOperationTypeChange(value);
      // Trigger change detection to update the UI
      this.cdr.detectChanges();
    });

    // Subscribe to dbType changes to update port
    this.dbConnectionForm.get('dbType')?.valueChanges.subscribe(value => {
      this.updatePortBasedOnDbType(value);
    });
  }

  get tables(): FormArray {
    return this.queryRequirementForm.get('tables') as FormArray;
  }

  // Getter methods for template to determine which section to show
  get isQueryOperation(): boolean {
    const value = this.queryRequirementForm.get('operationType')?.value;
    // Handle both string and numeric values
    return value === 'query' || value === 0;
  }

  get isOptimizeOperation(): boolean {
    const value = this.queryRequirementForm.get('operationType')?.value;
    // Handle both string and numeric values
    return value === 'optimize' || value === 1;
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.loadDatabaseTypes();
    // Initialize the form validation based on the default operation type
    this.handleOperationTypeChange('query');
  }

  loadDatabaseTypes() {
    this.sqlGeneratorService.getDatabaseTypes().subscribe({
      next: (response: any) => {
        this.databaseTypes = response || [];
      },
      error: (error: any) => {
        console.error('Error loading database types:', error);
        this.message.error('Failed to load database types');
      }
    });
  }

  // Update port based on selected database type
  private updatePortBasedOnDbType(dbType: string) {
    const portControl = this.dbConnectionForm.get('port');
    if (portControl) {
      const defaultPort = this.defaultPorts[dbType] || '3306';
      portControl.setValue(defaultPort);
    }
  }

  checkConnection() {
    if (this.dbConnectionForm.valid) {
      this.isConnectionLoading = true;
      const formData = this.dbConnectionForm.value;
      
      this.sqlGeneratorService.checkDbConnection(formData).subscribe({
        next: (response: any) => {
          this.isConnectionLoading = false;
          if (response.status === 'success') {
            this.message.success('Database connection successful');
            // Load tables after successful connection
            this.loadTables();
          } else {
            this.message.error(response.message || 'Database connection failed');
            // Clear loaded tables on connection failure
            this.tableOptions = [];
            // Clear table selections
            this.clearTableSelections();
          }
        },
        error: (error: any) => {
          this.isConnectionLoading = false;
          console.error('Connection error:', error);
          this.message.error('Database connection failed');
          // Clear loaded tables on connection error
          this.tableOptions = [];
          // Clear table selections
          this.clearTableSelections();
        }
      });
    } else {
      this.message.error('Please fill all required fields');
    }
  }

  loadTables() {
    if (this.dbConnectionForm.valid) {
      this.isTableLoading = true;
      const formData = this.dbConnectionForm.value;
      
      this.sqlGeneratorService.getTables(formData).subscribe({
        next: (response: any) => {
          this.isTableLoading = false;
          this.tableOptions = response || [];
          // If we have tables and the first table field is empty, set it to the first available table
          if (this.tableOptions.length > 0 && this.tables.length === 1 && (!this.tables.at(0).value || this.tables.at(0).value === '')) {
            this.tables.at(0).setValue(this.tableOptions[0]);
          }
        },
        error: (error: any) => {
          this.isTableLoading = false;
          console.error('Error loading tables:', error);
          this.message.error('Failed to load tables');
        }
      });
    }
  }

  addTable() {
    this.tables.push(this.fb.control(''));
  }

  removeTable(index: number) {
    if (this.tables.length > 1) {
      this.tables.removeAt(index);
    }
  }

  // Handle operation type changes to set conditional validation
  private handleOperationTypeChange(operationType: string | number) {
    const businessRequirementControl = this.queryRequirementForm.get('businessRequirement');
    const existingSqlControl = this.queryRequirementForm.get('existingSql');
    
    // Convert numeric values to string values
    const operationTypeStr = typeof operationType === 'number' ? 
      (operationType === 0 ? 'query' : 'optimize') : 
      operationType;
      
    if (operationTypeStr === 'query') {
      // For query operation, business requirement is required, existing SQL is optional
      businessRequirementControl?.setValidators([Validators.required]);
      existingSqlControl?.clearValidators();
    } else {
      // For optimize operation, existing SQL is required, business requirement is optional
      businessRequirementControl?.clearValidators();
      existingSqlControl?.setValidators([Validators.required]);
    }
    
    businessRequirementControl?.updateValueAndValidity();
    existingSqlControl?.updateValueAndValidity();
  }

  generatePrompt() {
    if (this.dbConnectionForm.valid && this.queryRequirementForm.valid && this.tables.length > 0 && this.tables.at(0).value !== '') {
      this.isGenerating = true;
      const formData = this.dbConnectionForm.value;
      
      // Get all table names from the form array
      const tableNames = this.tables.controls
        .map(control => control.value)
        .filter(value => value && value !== '');
      
      const operationTypeValue = this.queryRequirementForm.get('operationType')?.value;
      // Convert numeric values to string values
      const operationType = typeof operationTypeValue === 'number' ? 
        (operationTypeValue === 0 ? 'query' : 'optimize') : 
        operationTypeValue;
      
      const requestData: any = {
        ...formData,
        tableNames: tableNames,
        operationType: operationType
      };
      
      // Add either businessRequirement or existingSql based on operationType
      if (operationType === 'query') {
        requestData.businessRequirement = this.queryRequirementForm.get('businessRequirement')?.value;
      } else {
        requestData.existingSql = this.queryRequirementForm.get('existingSql')?.value;
      }
      
      this.sqlGeneratorService.generatePrompt(requestData).subscribe({
        next: (response: any) => {
          this.isGenerating = false;
          this.generatedPrompt = response.db_info || '';
          if (response.table_info) {
            this.generatedPrompt += '\n' + response.table_info;
          }
        },
        error: (error: any) => {
          this.isGenerating = false;
          console.error('Error generating prompt:', error);
          this.message.error('Failed to generate prompt');
        }
      });
    } else {
      // Check which field is invalid to show appropriate error message
      if (!this.queryRequirementForm.valid) {
        const operationTypeValue = this.queryRequirementForm.get('operationType')?.value;
        const operationType = typeof operationTypeValue === 'number' ? 
          (operationTypeValue === 0 ? 'query' : 'optimize') : 
          operationTypeValue;
          
        if (operationType === 'query') {
          this.message.error('Business Requirement is required');
        } else {
          this.message.error('Existing SQL is required');
        }
      } else {
        this.message.error('Please ensure connection is valid and at least one table is selected');
      }
    }
  }

  copyToClipboard() {
    if (this.generatedPrompt) {
      navigator.clipboard.writeText(this.generatedPrompt).then(() => {
        this.message.success('Prompt copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy: ', err);
        this.message.error('Failed to copy prompt');
      });
    }
  }

  /**
   * Clear all table selections in the form
   */
  private clearTableSelections(): void {
    // Clear all table selections by setting them to empty strings
    while (this.tables.length > 0) {
      this.tables.removeAt(0);
    }
    // Add one empty table control back
    this.tables.push(this.fb.control(''));
  }
}