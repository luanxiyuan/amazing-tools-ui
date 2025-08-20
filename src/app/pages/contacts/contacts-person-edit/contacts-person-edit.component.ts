import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CONTACTS_SETTINGS } from '../../../consts/sys-consts';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Person, Location, PersonEntity, Team, TeamEntity } from '../../../types/contacts-type';
import { StringToolService } from '../../../services/common/string-tool.service';
import { cloneDeep } from 'lodash';
import { DateService } from '../../../services/common/date.service';

@Component({
  selector: 'app-contacts-person-edit',
  templateUrl: './contacts-person-edit.component.html',
  styleUrls: ['./contacts-person-edit.component.css']
})
export class ContactsPersonEditComponent implements OnDestroy {

  editDrawerWidth: number = CONTACTS_SETTINGS.EDIT_DRAWER_WIDTH;

  @Input() personAddOrEditDrawerVisible: {'show':boolean} = {'show': false};
  @Input() addOrEditMode: 'Add' | "Edit" = 'Add';
  @Input() defaultPerson: Person = new PersonEntity();
  @Input() locations: Location[] = [];
  @Input() teams: Team[] = [];
  @Input() defaultTeam: Team = new TeamEntity();

  @Output() submitPersonEvent = new EventEmitter<Person>();

  validatePersonForm: FormGroup;
  public birthdayOptions: any[] = [];

  constructor(
    private msg: NzMessageService,
    public stringToolService: StringToolService,
    private dateService: DateService
  ) { 
    this.validatePersonForm = new FormGroup({
      soeId: new FormControl(''),
      name: new FormControl('', Validators.required),
      birthday: new FormControl([]),
      team: new FormControl(''),
      location: new FormControl(''),
      remark: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.birthdayOptions = this.dateService.generateMonthDaysObject();
  }

  ngOnChanges() {
    if (this.addOrEditMode ==='Edit' && this.defaultPerson.id) {
      this.validatePersonForm.setValue({
        soeId: this.defaultPerson.soeId,
        name: this.defaultPerson.name,
        birthday: this.defaultPerson.birthday || [],
        team: this.defaultPerson.team,
        location: this.defaultPerson.location,
        remark: this.defaultPerson.remark
      });
    } else if (this.addOrEditMode === 'Add') {
      this.validatePersonForm.setValue({
        soeId: '',
        name: '',
        birthday: [],
        team: this.defaultTeam.id,
        location: '',
        remark: ''
      });
    }
  }

  ngOnDestroy(): void {
    console.log("ContactsPersonEditComponent ngOnDestroy() id done");
  }

  closePersonAddOrEditDrawer() {
    this.personAddOrEditDrawerVisible = {'show': false};
  }

  submitPersonForm() {
    if (this.validatePersonForm.valid) {

      // populate the newPerson
      if (this.addOrEditMode === 'Edit') {
        // check if all the fields are the same with the selected person
        if (this.checkIfNoChangeInForm()) {
          this.msg.warning('No change on person, no update required');
          return;
        }
      }

      // populate the person entity
      const newPerson: Person = this.populatePerson();

      // send to parent component
      this.submitPersonEvent.emit(newPerson);

    }
  }

  populatePerson(): Person {
    let tempPerson = new PersonEntity();
    
    if (this.addOrEditMode === 'Add') {
      tempPerson.id = this.stringToolService.generateUUID();
    } else if (this.addOrEditMode === 'Edit') {
      tempPerson = cloneDeep(this.defaultPerson);
    }
    tempPerson.soeId = this.validatePersonForm.get('soeId')?.value;
    tempPerson.name = this.validatePersonForm.get('name')?.value;
    tempPerson.birthday = this.validatePersonForm.get('birthday')?.value;
    tempPerson.team = this.validatePersonForm.get('team')?.value;
    tempPerson.location = this.validatePersonForm.get('location')?.value;
    tempPerson.remark = this.validatePersonForm.get('remark')?.value;

    return tempPerson;
  }

  checkIfNoChangeInForm(): boolean {
    const person = this.defaultPerson;
    return person?.soeId === this.validatePersonForm.get('soeId')?.value &&
      person?.name === this.validatePersonForm.get('name')?.value &&
      person?.birthday === this.validatePersonForm.get('birthday')?.value &&
      person?.team === this.validatePersonForm.get('team')?.value &&
      person?.location === this.validatePersonForm.get('location')?.value &&
      person?.remark === this.validatePersonForm.get('remark')?.value;
  }

}
