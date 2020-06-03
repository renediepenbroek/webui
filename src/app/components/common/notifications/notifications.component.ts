import { Component, OnInit, Input } from '@angular/core';
import { NotificationsService, NotificationAlert } from 'app/services/notifications.service';
import { LocaleService } from 'app/services/locale.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  @Input() notificPanel;

  notifications: Array<NotificationAlert> = [];
  dismissedNotifications: Array<NotificationAlert> = []
  ngDateFormat;

  constructor(private notificationsService: NotificationsService, protected localeService: LocaleService) {
  }

  ngOnInit() {
    this.initData();
    setTimeout(() => {
      this.ngDateFormat = `${this.localeService.getAngularFormat()}`;
    }, 1000)

    setTimeout(() => {
      this.ngDateFormat = `${this.localeService.getAngularFormat()}`;
    }, 5000)

    this.notificationsService.getNotifications().subscribe((notifications)=>{
      this.notifications = [];
      this.dismissedNotifications = [];

      setTimeout(()=>{
        notifications.forEach((notification: NotificationAlert) => {
          if (notification.dismissed === false) {
            if (!_.find(this.notifications, {id:notification.id})) {
              this.notifications.push(notification);
            }
          } else {
            if (!_.find(this.dismissedNotifications, {id:notification.id})) {
              this.dismissedNotifications.push(notification);
            }
          }
        });
      }, -1);
    });
  }

  initData() {
    this.notifications = [];
    this.dismissedNotifications = [];

    const notificationAlerts: NotificationAlert[] = this.notificationsService.getNotificationList();
    notificationAlerts.forEach((notification: NotificationAlert) => {
      if (notification.dismissed === false) {
        this.notifications.push(notification);
      } else {
        this.dismissedNotifications.push(notification);
      }
    });
  }

  closeAll(e) {
    e.preventDefault();
    this.notificationsService.dismissNotifications(this.notifications);
  }

  reopenAll(e) {
    e.preventDefault();
    this.notificationsService.restoreNotifications(this.dismissedNotifications);
  }

  turnMeOff(notification: NotificationAlert, e) {
    e.preventDefault();
    this.notificationsService.dismissNotifications([notification]);
  }

  turnMeOn(notification: NotificationAlert, e) {
    e.preventDefault();
    this.notificationsService.restoreNotifications([notification]);
  }
}
