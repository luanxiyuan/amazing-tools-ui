export interface Location {
    id: string;
    name: string;
}

export interface Person {
    id: string;
    soeId: string;
    name: string;
    birthday: string[];
    team: string;
    location: string;
    remark: string;
    teamName?: string;
    locationName?: string;
}

export interface Team {
    id: string;
    name: string;
    teamDl: string;
    remark: string;
    persons?: Person[];
}

export interface TeamUIEntity extends Team {
    teamDls?: string[]
}

export interface UpcomingBirthdayPersons {
    categoryName: string;
    persons: Person[];
}

export class TeamEntity implements Team {
    id: string;
    name: string;
    teamDl: string;
    remark: string;

    constructor(id?: string, name?: string, teamDl?: string, remark?: string) {
        this.id = id || '';
        this.name = name || '';
        this.teamDl = teamDl || '';
        this.remark = remark || '';
    }
}

export class PersonEntity implements Person {
    id: string;
    soeId: string;
    name: string;
    birthday: string[];
    team: string;
    location: string;
    remark: string;

    constructor(soeId?: string, name?: string, birthday?: string[], team?: string, location?: string, remark?: string) {
        this.id = '';
        this.soeId = soeId || '';
        this.name = name || '';
        this.birthday = birthday || [];
        this.team = team || '';
        this.location = location || '';
        this.remark = remark || '';
    }
}