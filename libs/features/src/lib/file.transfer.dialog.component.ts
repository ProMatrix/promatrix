import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export class FileTransferData {
  public bytesTransfered = 0;
  public totalBytes = 0;
  public percentComplete = 0;
  public cancel = false;
}

@Component({
  templateUrl: './file.transfer.dialog.component.html',
})
export class FileTransferDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title, description, bytesTransfered, totalBytes, percentComplete, cancel }, private dialogRef: MatDialogRef<FileTransferDialogComponent>) {
  }

  public cancel(data: FileTransferData) {
    data.cancel = true;
    this.dialogRef.close();
  }
}
