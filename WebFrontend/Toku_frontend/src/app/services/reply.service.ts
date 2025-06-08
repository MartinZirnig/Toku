import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ReplyPreview {
  text?: string | null;
  previewText?: string | null;
  hasFile?: boolean;
  image?: string | null;
  Id: number
}

@Injectable({ providedIn: 'root' })
export class ReplyService {
  private replyPreviewSubject = new BehaviorSubject<ReplyPreview | null>(null);
  replyPreview$ = this.replyPreviewSubject.asObservable();

  setReply(preview: ReplyPreview) {
    this.replyPreviewSubject.next(preview);
  }

  clearReply() {
    this.replyPreviewSubject.next(null);
  }
}
