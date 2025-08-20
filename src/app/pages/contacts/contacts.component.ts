import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MODULE_TITLES, CONTACTS_SETTINGS, MONTHS } from '../../consts/sys-consts';
import { SharedStoreService } from '../../services/common/shared-store.service';
import { UrlToolService } from '../../services/common/url-tool.service';
import { BaseComponent } from '../base/base.component';
import { FaviconService } from '../../services/common/favicon.service';
import { Person, UpcomingBirthdayPersons } from '../../types/contacts-type';
import { ContactsService } from '../../services/contacts/contacts.service';
import { CommunicationToolService } from '../../services/common/communication-tool.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent extends BaseComponent {

  public findPersonFlag: boolean = false;
  public findTeamFlag: boolean = false;
  private faviconPath: string = CONTACTS_SETTINGS.FAVICON_PATH;
  showNotificationDialog: boolean = false;
  upcomingBirthdayPersons: UpcomingBirthdayPersons[] = [];

  constructor(
    private sharedStoreService: SharedStoreService,
    private urlToolService: UrlToolService,
    private titleService: Title,
    private faviconService: FaviconService,
    private contactsService: ContactsService,
    private communicationToolService: CommunicationToolService
  ) {
    super();
    
    // set the module title
    this.setTitle(MODULE_TITLES.CONTACTS);
    this.faviconService.setFavicon(this.faviconPath);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  switchFindType(selectType: string) {
    this.urlToolService.navigateTo(`/contacts/${selectType}`, {});

    this.sharedStoreService.setContactsTabValue(selectType as 'team' | 'person');
  }

  ngOnInit() {
    this.sharedStoreService.getContactsTabValue().subscribe((value) => {
      if (value === 'team') {
        this.findPersonFlag = false;
        this.findTeamFlag = true;
      } else if (value === 'person') {
        this.findPersonFlag = true;
        this.findTeamFlag = false;
      }
    });

    this.getAllPersons();
  }

  getAllPersons() {
    this.contactsService.getPersons().subscribe((data) => {
      if (data) {
        this.setUpcomingBirthdayPersons(data);
      }
    })
  }

  setUpcomingBirthdayPersons(persons: Person[]) {
    // loop persons and find person's birthday (format such as ['Jan', '20']) is today or upcoming 2 days, then put it in upcomingBirthdayPersons
    // 1. get today's and upcomming 3 days' month and day with format such as Jan-20
    // 2. loop persons and get person's birthday which format is ['Jan', '20'], reformat it to Jan-20
    // 3. if the reformated value match person's birthday, then put this person in this.upcomingBirthdayPersons
    const today = new Date();
    const upcomingDays: number = CONTACTS_SETTINGS.COMMING_BIRTHDAY_DAYS;
    const monthNames = MONTHS;
    for (let i = 0; i <= upcomingDays; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const birthday = monthNames[date.getMonth()] + '-' + date.getDate();
      this.getBirthdayPersonsWithInFewDays(i, birthday, persons);
    }
  }

  getBirthdayPersonsWithInFewDays(upcomingDays: number, birthdayStr: string, persons: Person[]): void {
    const filteredPersons =  persons.filter(person => {
      if (!person.birthday || person.birthday.length <= 0) {
        return false;
      } 
      return person.birthday.join('-') === birthdayStr;
    });

    if (!filteredPersons || filteredPersons.length <= 0) {
      return;
    }

    let categoryName = '';
    if (upcomingDays === 0) {
      categoryName = 'Today';
    } else if  (upcomingDays === 1) {
      categoryName = `${upcomingDays} Day Later`;
    } else {
      categoryName = `${upcomingDays} Days Later`;
    }

    const birthdayObj = {
      "categoryName": categoryName,
      "persons": filteredPersons
    }

    this.upcomingBirthdayPersons.push(birthdayObj);
  }

  openNotificationPopup() {
    this.showNotificationDialog = true;
  }

  closeNotificationDialog() {
    this.showNotificationDialog = false;
  }

  openTeamsWindow(soeId: string) {
    this.communicationToolService.openTeamsWindow(soeId);
  }
}
