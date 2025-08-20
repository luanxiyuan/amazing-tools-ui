export interface Abbreviation {
    id: string;
    abbreviation: string;
    fullName: string;
    remarks: string;
}

export class AbbreviationEntity implements Abbreviation {
    id: string;
    abbreviation: string;
    fullName: string;
    remarks: string;

    constructor(id?: string, abbreviation?: string, fullName?: string, remarks?: string) {
        this.id = id || '';
        this.abbreviation = abbreviation || '';
        this.fullName = fullName || '';
        this.remarks = remarks || '';
    }
}