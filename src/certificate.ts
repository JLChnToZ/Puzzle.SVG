import { MainHandler } from '.';
import { formatTime } from './utils';

const certificate = document.querySelector('#certificate')!;
const timeStartElement = certificate.querySelector<SVGTextElement>('text#time-start')!;
const timeEndElement = certificate.querySelector<SVGTextElement>('text#time-end')!;
const timeUsedElement = certificate.querySelector<SVGTextElement>('text#time-used')!;


export function showCertificate(mainHandler: MainHandler) {
  if(!certificate) return;
  certificate.classList.add('show');
  certificate.setAttribute('visibility', 'visible');
  certificate.setAttribute('pointer-events', 'visible');
  timeStartElement.textContent = mainHandler.startTime?.toString() ?? '';
  timeEndElement.textContent = mainHandler.endTime?.toString() ?? '';
  timeUsedElement.textContent = formatTime(mainHandler.time);
}

export function hideCetificate() {
  certificate?.classList.remove('show');
  timeStartElement.textContent = '';
  timeEndElement.textContent = '';
  timeUsedElement.textContent = '--:--';
}