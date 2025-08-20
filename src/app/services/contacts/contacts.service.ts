import { Injectable } from '@angular/core';
import { HttpClientService } from '../common/http-client.service';
import { Location, Person, Team } from '../../types/contacts-type';
import { Observable, catchError, map } from 'rxjs';
import { SharedStoreService } from '../common/shared-store.service';
import { CONTACTS_SETTINGS, CONTACTS_URIS } from '../../consts/sys-consts';
import { HttpParams } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { cloneDeep, get } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {

  constructor(
    private httpClientService: HttpClientService,
    private msg: NzMessageService,
    private sharedStoreService: SharedStoreService
  ) { }

  getLocations(): Observable<Location[]> {
    let locations: Location[] = [];
    this.sharedStoreService.setLoading(true);
    return this.httpClientService.get(CONTACTS_URIS.LOCATIONS).pipe(
      map(data => {
        this.sharedStoreService.setLoading(false);
        locations = data as Location[];
        return locations;
      }),
      catchError(error => {
        this.sharedStoreService.setLoading(false);
        console.error('An error occurred in getLocations:', error);
        return [];
      })
    )
  }

  getPersons(): Observable<Person[]> {
    let persons: Person[] = [];
    this.sharedStoreService.setLoading(true);
    return this.httpClientService.get(CONTACTS_URIS.PERSONS).pipe(
      map(data => {
        this.sharedStoreService.setLoading(false);
        persons = data as Person[];
        return persons;
      }),
      catchError(error => {
        this.sharedStoreService.setLoading(false);
        console.error('An error occurred in getPersons:', error);
        return [];
      })
    )
  }

  getTeams(): Observable<Team[]> {
    let teams: Team[] = [];
    this.sharedStoreService.setLoading(true);
    return this.httpClientService.get(CONTACTS_URIS.TEAMS).pipe(
      map(data => {
        this.sharedStoreService.setLoading(false);
        teams = data as Team[];
        return teams;
      }),
      catchError(error => {
        this.sharedStoreService.setLoading(false);
        console.error('An error occurred in getTeams:', error);
        return [];
      })
    )
  }

  sortLocationByName(data: Location[]): Location[] {
    // sort the data as per field name
    data.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    return data;
  }

  sortTeamByName(data: Team[]): Team[] {
    // sort the data as per field name
    data.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    return data;
  }

  // loop through the data and get the corresponding persons, then put it in field persons under team
  // don't put in case of person.team is empty
  addPersonsUnderTeam(teams: Team[], persons: Person[]): Team[] {
    teams.forEach(team => {
      team.persons = persons.filter(person => {
        if (person.team === '') {
          return false;
        } else {
          return person.team === team.id;
        }
      });
    });
    return teams;
  }

  sortPersonByTeamAndName(data: Person[]) {
    data.sort((a, b) => {
      if (a.team < b.team) {
        return -1;
      } else if (a.team > b.team) {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
    return data;
  }

  filterPersons(persons: Person[], soeId: string, name: string, team: string, location: string, remark: string): Person[] {
    let filteredPersons: Person[] = cloneDeep(persons);
    if (soeId) {
      filteredPersons = filteredPersons.filter(person => 
        person.soeId?.toLowerCase().includes(soeId.toLowerCase())
      )
    }
    if (name) {
      filteredPersons = filteredPersons.filter(person =>
        person.name?.toLowerCase().includes(name.toLowerCase())
      )
    }
    if (team) {
      filteredPersons = filteredPersons.filter(person =>
        person.team?.toLowerCase().includes(team.toLowerCase())
      )
    }
    if (location) {
      filteredPersons = filteredPersons.filter(person =>
        person.location?.toLowerCase().includes(location.toLowerCase())
      )
    }
    if (remark) {
      filteredPersons = filteredPersons.filter(person =>
        person.remark?.toLowerCase().includes(remark.toLowerCase())
      )
    }
    return filteredPersons;
  }

  filterTeams(teams: Team[], name: string, teamDl: string, remark: string): Team[] {
    let filteredTeams: Team[] = cloneDeep(teams);
    if (name) {
      filteredTeams = filteredTeams.filter(team =>
        team.name?.toLowerCase().includes(name.toLowerCase())
      )
    }
    if (teamDl) {
      filteredTeams = filteredTeams.filter(team =>
        team.teamDl?.toLowerCase().includes(teamDl.toLowerCase())
      )
    }
    if (remark) {
      filteredTeams = filteredTeams.filter(team =>
        team.remark?.toLowerCase().includes(remark.toLowerCase())
      )
    }
    return filteredTeams;
  }

  findPersonById(persons: Person[], id: string): Person | undefined {
    return persons.find(person => person.id === id);
  }

  findTeamById(teams: Team[], id: string): Team | undefined {
    return teams.find(team => team.id === id);
  }

  updateTeam(teams: Team[]): void {
    // write a function to send http request to update the team
    this.sharedStoreService.setLoading(true);
    let params = new HttpParams();
    params = params.append('teams', JSON.stringify(teams));
    this.httpClientService.post(CONTACTS_URIS.TEAMS, params).subscribe({
      next: (data) => {
        this.sharedStoreService.setLoading(false);
        if (get(data, 'status') === "success") {
          this.msg.success('Team updated successfully.');
          this.sharedStoreService.setTeamUpdateResultFlag(true);
        } else {
          this.msg.error('Team updated failed');
        }
      },
      error: (error) => {
        this.sharedStoreService.setLoading(false);
        console.error(error);
        this.msg.error('Team updated failed');
      },
      complete: () => {}
    });
  }

  updatePerson(persons: Person[]): void {
    // write a function to send http request to update the person
    this.sharedStoreService.setLoading(true);
    let params = new HttpParams();
    params = params.append('persons', JSON.stringify(persons));
    this.httpClientService.post(CONTACTS_URIS.PERSONS, params).subscribe({
      next: (data) => {
        this.sharedStoreService.setLoading(false);
        if (get(data, 'status') === "success") {
          this.msg.success('Person updated successfully.');
          this.sharedStoreService.setPersonUpdateResultFlag(true);
        } else {
          this.msg.error('Person updated failed');
        }
      },
      error: (error) => {
        this.sharedStoreService.setLoading(false);
        console.error(error);
        this.msg.error('Person updated failed');
      },
      complete: () => {}
    });
  }

  removeTeamNameAndLocationNameFromPersons(persons: Person[]) {
    //remove attribute teamName
    persons.forEach(person => {
      delete person.teamName;
      delete person.locationName;
    });
  }

  exportPersonToExcel() {
    this.httpClientService.downloadFile(CONTACTS_URIS.PERSONS_EXCEL, CONTACTS_SETTINGS.PERSON_EXCEL_FILE_NAME);
  }
}
