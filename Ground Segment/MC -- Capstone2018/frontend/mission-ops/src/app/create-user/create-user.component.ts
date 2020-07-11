import { Component, OnInit, ViewChild, isDevMode } from '@angular/core';

import { UsersService } from 'src/app/services/users/users.service';
import { AlertComponent } from '../alert/alert.component';
import { AuthService } from 'src/app/services/auth/auth.service';

/**
 * A component for creating new users for the application.
 *
 * @export
 * @class CreateUserComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  @ViewChild(AlertComponent, {static: false})
  private alert: AlertComponent;

  private name: string;
  private email: string;
  private admin: boolean;
  private phone: string;
  private prefContact: string = 'email';

  private processing: boolean = false;

  constructor(private users: UsersService, private auth: AuthService) { }

  ngOnInit() {  }

  /**
   * Creates a new user with the data specified in the form.
   *
   * @returns {void}
   * @memberof CreateUserComponent
   */
  public create(): void {
    this.processing = true;
    this.alert.hide();

    let error;
    if (!this.name) {
      error = 'Name field cannot be blank';
    }
    if (!this.email) {
      error = 'Email field cannot be blank.';
    }
    let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!regex.test(this.email)) {
      error = 'Email must be a valid email address.';
    }

    if (error) {
      this.alert.show('Error', error, 'danger');
      this.processing = false;
      return; // Break out of the function before attempting to send bad info to the auth service
    }

    // Create the user with the email as their username and an autogenerated temporary password
    this.users.createUser(this.name, null, this.email, this.admin, this.phone, this.prefContact, {
      onSuccess: () => {
        this.processing = false;
        this.alert.show('Success!', `User ${this.email} has been created, and a welcome email has been sent to them.`, 'success');
        
        this.name = '';
        this.email = '';
        this.admin = false;
        this.phone = '';
        this.prefContact = 'email';
      },
      onFailure: (err: any) => {
        this.processing = false;

        if (isDevMode()) {
          this.alert.show(err.name, err.message, 'danger');
        } else if (err.name === '') {
          this.alert.show('Error: Duplicate Username', `A user with username ${this.email} already exists.`, 'danger');
        } else {
          this.alert.show('Error', 'An error occurred.', 'danger');
        }
      }
    })
  }
}
