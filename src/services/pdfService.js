import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export class PdfService {
  constructor() {
    this.pdfDoc = null;
    this.numPages = 0;
    this.pageCache = new Map();
    this.thumbnailCache = new Map();
    this.inFlightRenders = new Map();
  }

  async load(source) {
    this.pageCache.clear();
    this.thumbnailCache.clear();
    this.inFlightRenders.clear();

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
    // Pastikan DPR minimal 2 agar teks Arab dan harakat sangat tajam di layar ponsel dan desktop
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
    const targetScale = options.scale || 1.6;
    const actualScale = targetScale * dpr;

    // Viewport kalkulasi pada resolusi tinggi penuh
    const viewport = page.getViewport({ scale: actualScale });
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
    canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

    const ctx = canvas.getContext('2d', { alpha: false });

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      intent: 'display',
    };

    await page.render(renderContext).promise;
    return { width: Math.floor(viewport.width / dpr), height: Math.floor(viewport.height / dpr) };
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

  async renderPageToImage(pageNumber, scale = 1.8) {
    if (this.pageCache.has(pageNumber)) {
      return this.pageCache.get(pageNumber);
    }

    if (this.inFlightRenders.has(pageNumber)) {
      return this.inFlightRenders.get(pageNumber);
    }

    const renderTask = (async () => {
      try {
        const canvas = document.createElement('canvas');
        await this.renderPageToCanvas(pageNumber, canvas, { scale });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        this.pageCache.set(pageNumber, dataUrl);
        return dataUrl;
      } finally {
        this.inFlightRenders.delete(pageNumber);
      }
    })();

    this.inFlightRenders.set(pageNumber, renderTask);
    return renderTask;
  }
}

export const pdfService = new PdfService();
