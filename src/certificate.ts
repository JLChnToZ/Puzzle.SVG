import { MainHandler } from '.';
import { formatTime, formatDateTime } from './utils';

const certificate = document.querySelector('#certificate')!;
const timeStartElement = certificate.querySelector<SVGTextElement>('text#time-start')!;
const timeEndElement = certificate.querySelector<SVGTextElement>('text#time-end')!;
const timeUsedElement = certificate.querySelector<SVGTextElement>('text#time-used')!;
const puzzleSizeElement = certificate.querySelector<SVGTextElement>('text#puzzle-size')!;

export function showCertificate(mainHandler: MainHandler) {
  certificate.classList.add('show');
  certificate.setAttribute('visibility', 'visible');
  certificate.setAttribute('pointer-events', 'visible');
  timeStartElement.textContent = formatDateTime(mainHandler.startTime);
  timeEndElement.textContent = formatDateTime(mainHandler.endTime);
  timeUsedElement.textContent = formatTime(mainHandler.time);
  puzzleSizeElement.textContent = `${mainHandler.xCount}×${mainHandler.yCount} (${mainHandler.xCount * mainHandler.yCount} Pieces)`;
}

export function hideCetificate() {
  certificate.classList.remove('show');
  timeStartElement.textContent = '';
  timeEndElement.textContent = '';
  timeUsedElement.textContent = '';
  puzzleSizeElement.textContent = '';
}