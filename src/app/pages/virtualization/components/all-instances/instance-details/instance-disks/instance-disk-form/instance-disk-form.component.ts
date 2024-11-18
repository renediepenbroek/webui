import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VirtualizationDeviceType } from 'app/enums/virtualization.enum';
import { VirtualizationDisk } from 'app/interfaces/virtualization.interface';
import { FormActionsComponent } from 'app/modules/forms/ix-forms/components/form-actions/form-actions.component';
import { IxExplorerComponent } from 'app/modules/forms/ix-forms/components/ix-explorer/ix-explorer.component';
import { IxFieldsetComponent } from 'app/modules/forms/ix-forms/components/ix-fieldset/ix-fieldset.component';
import { IxInputComponent } from 'app/modules/forms/ix-forms/components/ix-input/ix-input.component';
import { IxListItemComponent } from 'app/modules/forms/ix-forms/components/ix-list/ix-list-item/ix-list-item.component';
import { FormErrorHandlerService } from 'app/modules/forms/ix-forms/services/form-error-handler.service';
import { ChainedRef } from 'app/modules/slide-ins/chained-component-ref';
import { ModalHeader2Component } from 'app/modules/slide-ins/components/modal-header2/modal-header2.component';
import { SnackbarService } from 'app/modules/snackbar/services/snackbar.service';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { FilesystemService } from 'app/services/filesystem.service';
import { ApiService } from 'app/services/websocket/api.service';

@UntilDestroy()
@Component({
  selector: 'ix-instance-disk-form',
  templateUrl: './instance-disk-form.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IxExplorerComponent,
    IxInputComponent,
    IxListItemComponent,
    ReactiveFormsModule,
    TranslateModule,
    MatCard,
    MatCardContent,
    ModalHeader2Component,
    IxFieldsetComponent,
    FormActionsComponent,
    MatButton,
    TestDirective,
  ],
})
export class InstanceDiskFormComponent {
  protected readonly isLoading = signal(false);
  protected readonly directoryNodeProvider = this.filesystem.getFilesystemNodeProvider({ directoriesOnly: false });

  protected form = this.formBuilder.nonNullable.group({
    source: ['', Validators.required],
    destination: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private errorHandler: FormErrorHandlerService,
    private ws: ApiService,
    private slideInRef: ChainedRef<string>,
    private translate: TranslateService,
    private snackbar: SnackbarService,
    private filesystem: FilesystemService,
  ) {}

  onSubmit(): void {
    const instanceId = this.slideInRef.getData();
    this.isLoading.set(true);

    const payload = {
      ...this.form.value,
      dev_type: VirtualizationDeviceType.Disk,
    } as VirtualizationDisk;

    this.ws.call('virt.instance.device_add', [instanceId, payload])
      .pipe(untilDestroyed(this))
      .subscribe({
        complete: () => {
          this.snackbar.success(this.translate.instant('Disk added'));
          this.slideInRef.close({
            error: false,
            response: true,
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorHandler.handleWsFormError(error, this.form);
          this.isLoading.set(false);
        },
      });
  }
}