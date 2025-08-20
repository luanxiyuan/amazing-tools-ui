import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { SYS_SETTINGS } from '../../consts/sys-consts';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileToolService {

  constructor(private httpClientService: HttpClientService) { }

  public loadingJSONObj(url: string): any {
    return this.httpClientService.get(url);
  }

  public loadGlobalConfigFile(): any {
    return this.loadingJSONObj(SYS_SETTINGS.GLOBAL_CONFIG_FILE_PATH);
  }

  public loadSplunkConfigFile(): any {
    return this.loadingJSONObj(SYS_SETTINGS.SPLUNK_CONFIG_FILE_PATH);
  }

  public loadModuleConfigFromGlobalConfigFile(moduleId: string): any {
    return this.loadGlobalConfigFile().subscribe((data: any) => {
      const modules = data['apps'] || [];
      return modules.find((module: any) => module.id === moduleId);
    });
  }

  public convertFileToBase64(file: File): Observable<string> {
    return new Observable<string>((observer) => {
      const reader = new FileReader();

      reader.onload = () => {
        observer.next(reader.result as string); // Emit the Base64 string
        observer.complete(); // Complete the observable
      };

      reader.onerror = (error) => {
        observer.error(error); // Emit an error if something goes wrong
      };

      reader.readAsDataURL(file); // Read the file as a Base64-encoded string
    });
  }

  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  validateFileSize(file: File, maxSizeMb: number): boolean {
    return file.size / 1024 / 1024 < maxSizeMb;
  }

  convertBase64ToFile(base64SourceText: string, fileName: string): File | null {
    let file: File | null = null;
    try {
      const base64Data = base64SourceText.split(',')[1]; // Extract the Base64 data (after the comma)
      const mimeType = base64SourceText.match(/data:(.*?);base64/)?.[1] || 'application/octet-stream'; // Extract MIME type
      const byteCharacters = atob(base64Data); // Decode Base64 string
      const byteNumbers = new Array(byteCharacters.length);
  
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      file = new File([byteArray], fileName, { type: mimeType }); // Create a File object
    } catch (error) {
      console.error('Error converting Base64 to file:', error);
    }
    return file;
  }
  
  downloadFile(file: File): void {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url); // Clean up the URL object
  }

}
