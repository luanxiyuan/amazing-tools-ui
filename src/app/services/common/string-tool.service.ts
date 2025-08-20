import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class StringToolService {

  constructor(private msg: NzMessageService) { }

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.msg.success('Copied to your clipboard');
    } catch {
      const element = document.createElement('textarea')
      const previouslyFocusedElement = document.activeElement

      element.value = text

      // Prevent keyboard from showing on mobile
      element.setAttribute('readonly', '')

      element.style.contain = 'strict'
      element.style.position = 'absolute'
      element.style.left = '-9999px'
      element.style.fontSize = '12pt' // Prevent zooming on iOS

      const selection = document.getSelection()
      const originalRange = selection
        ? selection.rangeCount > 0 && selection.getRangeAt(0)
        : null

      document.body.appendChild(element)
      element.select()

      // Explicit selection workaround for iOS
      element.selectionStart = 0
      element.selectionEnd = text.length

      document.execCommand('copy')
      document.body.removeChild(element)

      if (originalRange) {
        selection!.removeAllRanges() // originalRange can't be truthy when selection is falsy
        selection!.addRange(originalRange)
      }

      // Get the focus back on the previously focused element, if any
      if (previouslyFocusedElement) {
        ; (previouslyFocusedElement as HTMLElement).focus()
      }

      this.msg.success('Copied to your clipboard');
    }
  }

  generateUUID() {
    return uuid();
  }

  isValidJson(json: string) {
    try {
      JSON.parse(json);
      return true;
    } catch (error) {
      return false;
    }
  }

  addLinksToWordsInText(text: string, wordsRepository: string[], link: string, breakLineRequired?: boolean): string {
    if (!text) {
      return '';
    }
    const words = text.split(/(\W+)/);
    for (let i = 0; i < words.length; i++) {
      const wordIndex = wordsRepository.indexOf(words[i]);
      if (wordIndex !== -1) {
        const formattedLink = this.replaceLinkVariableWithParams(link, [words[i]]);
        words[i] = `<span><a href="${formattedLink}" target="_blank">${words[i]}</a></span>`;
      }
    }
    if (breakLineRequired) {
      return words.join('').replace(/\n/g, '<br>');
    } else {
      return words.join('');
    }
  }

  replaceLinkVariableWithParams(link: string, params: string[]): string {
    let formattedLink = link;
    params.forEach((param, index) => {
      formattedLink = formattedLink.replace(`{${index}}`, param);
    });
    return formattedLink;
  }
}
