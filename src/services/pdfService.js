import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export class PdfService {
  constructor() {
    this.pdfDoc = null;
    this.numPages = 0;
    this.pageCache = new Map();
    this.thumbnailCache = new Map();
  }

  async load(source) {
    this.pageCache.clear();
    this.thumbnailCache.clear();

    let docInit;
    if (typeof source === 'string') {
      docInit = source;
    } else if (source instanceof ArrayBuffer) {
      // Salin buffer agar worker transfer di pdfjsLib tidak membuat detached buffer asli
      docInit = { data: new Uint8Array(source.slice(0)) };
    } else if (source instanceof Uint8Array) {
      docInit = { data: source.slice() };
    } else if (source && source.buffer instanceof ArrayBuffer) {
      docInit = { data: new Uint8Array(source.buffer.slice(0)) };
    } else {
      docInit = { data: source };
    }

    const loadingTask = pdfjsLib.getDocument(docInit);
    this.pdfDoc = await loadingTask.promise;
    this.numPages = this.pdfDoc.numPages;
    return this.numPages;
  }

  async getPage(pageNumber) {
    if (!this.pdfDoc) throw new Error('Dokumen PDF belum dimuat.');
    return await this.pdfDoc.getPage(pageNumber);
  }

  async renderPageToCanvas(pageNumber, canvas, options = {}) {
    const page = await this.getPage(pageNumber);
    const dpr = window.devicePixelRatio || 1;
    const targetScale = options.scale || 1.5;

    // Viewport kalkulasi
    const viewport = page.getViewport({ scale: targetScale });
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.scale(dpr, dpr);

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      intent: 'display',
    };

    await page.render(renderContext).promise;
    return { width: viewport.width, height: viewport.height };
  }

  async getPageThumbnail(pageNumber, targetWidth = 140) {
    if (this.thumbnailCache.has(pageNumber)) {
      return this.thumbnailCache.get(pageNumber);
    }

    const page = await this.getPage(pageNumber);
    const baseViewport = page.getViewport({ scale: 1.0 });
    const scale = targetWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const ctx = canvas.getContext('2d', { alpha: false });
    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    this.thumbnailCache.set(pageNumber, dataUrl);
    return dataUrl;
  }

  async renderPageToImage(pageNumber, scale = 1.6) {
    if (this.pageCache.has(pageNumber)) {
      return this.pageCache.get(pageNumber);
    }

    const canvas = document.createElement('canvas');
    await this.renderPageToCanvas(pageNumber, canvas, { scale });
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    this.pageCache.set(pageNumber, dataUrl);
    return dataUrl;
  }
}

export const pdfService = new PdfService();
