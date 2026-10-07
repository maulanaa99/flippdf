import * as PageFlipModule from 'page-flip';
import { pdfService } from './services/pdfService.js';
import {
  getActivePdf,
  saveActivePdf,
  clearActivePdf,
  getAdminPin,
  setAdminPin,
} from './services/storageService.js';
import { audioService } from './services/audioService.js';
import { renderQRCode, downloadQRCode, copyPublicationLink } from './services/qrService.js';

// Pastikan inisialisasi class PageFlip aman di segala lingkungan modul
const PageFlip = PageFlipModule.PageFlip || PageFlipModule.default?.PageFlip || PageFlipModule.default;

// State Aplikasi
const appState = {
  viewMode: 'flip', // 'flip' atau 'scroll'
  zoomLevel: 1.0,
  currentPage: 1,
  totalPages: 1,
  activePdfSource: null,
  pageFlipInstance: null,
  pageImages: [],
  publicationTitle: 'Surat Yasin & Tahlil',
  publicationDedication: 'Mengenang Almarhum / Almarhumah',
  adminAuthenticated: false,
  pendingPdfBuffer: null,
  pendingPdfMeta: null,
};

// Referensi Elemen DOM
const dom = {
  displayPubTitle: document.getElementById('displayPubTitle'),
  displayPubDedication: document.getElementById('displayPubDedication'),
  btnModeFlip: document.getElementById('btnModeFlip'),
  btnModeScroll: document.getElementById('btnModeScroll'),
  btnZoomIn: document.getElementById('btnZoomIn'),
  btnZoomOut: document.getElementById('btnZoomOut'),
  btnZoomReset: document.getElementById('btnZoomReset'),
  zoomLevelText: document.getElementById('zoomLevelText'),
  btnToggleAudio: document.getElementById('btnToggleAudio'),
  iconAudioOn: document.getElementById('iconAudioOn'),
  iconAudioOff: document.getElementById('iconAudioOff'),
  btnOpenQrModal: document.getElementById('btnOpenQrModal'),
  btnToggleFullscreen: document.getElementById('btnToggleFullscreen'),
  btnOpenAdminModal: document.getElementById('btnOpenAdminModal'),
  
  // Viewports & States
  stateLoading: document.getElementById('stateLoading'),
  loadingStatusText: document.getElementById('loadingStatusText'),
  loadingProgressBar: document.getElementById('loadingProgressBar'),
  stateEmpty: document.getElementById('stateEmpty'),
  stateError: document.getElementById('stateError'),
  errorMessageText: document.getElementById('errorMessageText'),
  btnRetryLoad: document.getElementById('btnRetryLoad'),
  btnErrorResetDefault: document.getElementById('btnErrorResetDefault'),
  btnLoadDefaultSample: document.getElementById('btnLoadDefaultSample'),
  btnEmptyOpenAdmin: document.getElementById('btnEmptyOpenAdmin'),

  // Flipbook & Scroll Wrappers
  flipbookWrapper: document.getElementById('flipbookWrapper'),
  flipbookContainer: document.getElementById('flipbookContainer'),
  scrollWrapper: document.getElementById('scrollWrapper'),
  scrollPagesList: document.getElementById('scrollPagesList'),
  btnPrevPageFloating: document.getElementById('btnPrevPageFloating'),
  btnNextPageFloating: document.getElementById('btnNextPageFloating'),
  btnPrevPageFooter: document.getElementById('btnPrevPageFooter'),
  btnNextPageFooter: document.getElementById('btnNextPageFooter'),
  inputJumpPage: document.getElementById('inputJumpPage'),
  totalPagesText: document.getElementById('totalPagesText'),
  btnToggleThumbnails: document.getElementById('btnToggleThumbnails'),
  thumbnailsDrawer: document.getElementById('thumbnailsDrawer'),
  btnCloseThumbnails: document.getElementById('btnCloseThumbnails'),
  thumbnailsList: document.getElementById('thumbnailsList'),

  // Modal QR
  modalQr: document.getElementById('modalQr'),
  btnCloseQrModal: document.getElementById('btnCloseQrModal'),
  qrCanvas: document.getElementById('qrCanvas'),
  inputShareUrl: document.getElementById('inputShareUrl'),
  btnCopyShareUrl: document.getElementById('btnCopyShareUrl'),
  btnDownloadQr: document.getElementById('btnDownloadQr'),
  btnNativeShare: document.getElementById('btnNativeShare'),

  // Modal Admin
  modalAdmin: document.getElementById('modalAdmin'),
  btnCloseAdminModal: document.getElementById('btnCloseAdminModal'),
  adminStepAuth: document.getElementById('adminStepAuth'),
  formAdminAuth: document.getElementById('formAdminAuth'),
  inputAdminPin: document.getElementById('inputAdminPin'),
  adminAuthError: document.getElementById('adminAuthError'),
  btnSubmitAdminAuth: document.getElementById('btnSubmitAdminAuth'),
  adminStepPanel: document.getElementById('adminStepPanel'),
  tabBtnUpload: document.getElementById('tabBtnUpload'),
  tabBtnSettings: document.getElementById('tabBtnSettings'),
  tabContentUpload: document.getElementById('tabContentUpload'),
  tabContentSettings: document.getElementById('tabContentSettings'),
  uploadDropzone: document.getElementById('uploadDropzone'),
  inputFilePdf: document.getElementById('inputFilePdf'),
  btnBrowseFile: document.getElementById('btnBrowseFile'),
  previewSection: document.getElementById('previewSection'),
  previewFileName: document.getElementById('previewFileName'),
  previewPageCount: document.getElementById('previewPageCount'),
  previewFileSize: document.getElementById('previewFileSize'),
  canvasPreviewFirst: document.getElementById('canvasPreviewFirst'),
  canvasPreviewMid: document.getElementById('canvasPreviewMid'),
  canvasPreviewLast: document.getElementById('canvasPreviewLast'),
  btnPublishNewPdf: document.getElementById('btnPublishNewPdf'),
  btnResetToDefaultPdf: document.getElementById('btnResetToDefaultPdf'),
  formPubSettings: document.getElementById('formPubSettings'),
  inputPubTitle: document.getElementById('inputPubTitle'),
  inputPubDedication: document.getElementById('inputPubDedication'),
  inputNewPin: document.getElementById('inputNewPin'),
  btnSavePubSettings: document.getElementById('btnSavePubSettings'),

  // Toast
  toastNotification: document.getElementById('toastNotification'),
  toastMessage: document.getElementById('toastMessage'),
};

// ==========================================================================
// Inisialisasi Aplikasi
// ==========================================================================
async function initApp() {
  bindEventListeners();
  updateAudioIcon();

  // Muat data publikasi tersimpan atau default
  try {
    const savedRecord = await getActivePdf();
    if (savedRecord && savedRecord.buffer) {
      appState.activePdfSource = savedRecord.buffer;
      if (savedRecord.title) appState.publicationTitle = savedRecord.title;
      if (savedRecord.dedication) appState.publicationDedication = savedRecord.dedication;
    } else {
      appState.activePdfSource = '/yasin-default.pdf';
    }
  } catch (err) {
    console.warn('Gagal membaca IndexedDB, memuat contoh default:', err);
    appState.activePdfSource = '/yasin-default.pdf';
  }

  updateHeaderMetadata();
  await loadAndRenderDocument(appState.activePdfSource);
}

function updateHeaderMetadata() {
  dom.displayPubTitle.textContent = appState.publicationTitle;
  dom.displayPubDedication.textContent = appState.publicationDedication;
  dom.inputPubTitle.value = appState.publicationTitle;
  dom.inputPubDedication.value = appState.publicationDedication;
}

// ==========================================================================
// Memuat dan Merender Dokumen PDF
// ==========================================================================
async function loadAndRenderDocument(source) {
  showState('loading');
  dom.loadingStatusText.textContent = 'Membaca data berkas PDF...';
  dom.loadingProgressBar.style.width = '25%';

  try {
    const numPages = await pdfService.load(source);
    appState.totalPages = numPages;
    dom.totalPagesText.textContent = String(numPages);
    dom.inputJumpPage.max = String(numPages);

    dom.loadingStatusText.textContent = 'Menyiapkan lembaran buku digital...';
    dom.loadingProgressBar.style.width = '60%';

    // Siapkan wadah flipbook
    await setupFlipbookContainer(numPages);

    // Siapkan daftar cuplikan (thumbnails)
    setupThumbnails(numPages);

    // Selesai memuat
    dom.loadingProgressBar.style.width = '100%';
    setTimeout(() => {
      hideStates();
      updateNavigationControls();
    }, 200);

  } catch (error) {
    console.error('Kendala memuat PDF:', error);
    dom.errorMessageText.textContent = `Tidak dapat memuat PDF: ${error.message || 'Format tidak valid'}.`;
    showState('error');
  }
}

// Fungsi membuat atau memperbarui instance PageFlip berbasis canvas murni
function createOrUpdatePageFlip(imageUrls) {
  if (appState.pageFlipInstance) {
    try {
      appState.pageFlipInstance.destroy();
    } catch (e) {
      console.warn('Kendala mematikan instance PageFlip lama:', e);
    }
    appState.pageFlipInstance = null;
  }

  dom.flipbookContainer.innerHTML = '';

  const isMobile = window.innerWidth < 768;
  const availW = Math.min(window.innerWidth, dom.flipbookWrapper.clientWidth || window.innerWidth) - (isMobile ? 12 : 48);
  const availH = Math.min(window.innerHeight - 110, dom.flipbookWrapper.clientHeight || (window.innerHeight - 110)) - (isMobile ? 10 : 24);

  let pageWidth, pageHeight;
  if (isMobile) {
    // Mode satu halaman (portrait) pada ponsel
    const maxW = Math.max(260, Math.min(availW, 440));
    const maxH = Math.max(380, availH);
    pageWidth = Math.floor(Math.min(maxW, maxH / 1.414));
    pageHeight = Math.floor(pageWidth * 1.414);
  } else {
    // Mode dua halaman (landscape spread) pada desktop
    const maxBookW = Math.min(availW, 1100);
    const maxBookH = Math.min(availH, 750);
    pageWidth = Math.floor(Math.min(maxBookW / 2, maxBookH / 1.414));
    pageHeight = Math.floor(pageWidth * 1.414);
  }

  // Batas bawah aman jika elemen viewport belum selesai mengukur
  if (pageWidth < 220) pageWidth = isMobile ? 320 : 440;
  if (pageHeight < 310) pageHeight = Math.floor(pageWidth * 1.414);

  // Set ukuran eksplisit pada container agar pembungkus tidak kolaps
  const totalW = pageWidth * (isMobile ? 1 : 2);
  dom.flipbookContainer.style.width = `${totalW}px`;
  dom.flipbookContainer.style.height = `${pageHeight}px`;

  // Inisialisasi PageFlip dalam mode HTML DOM (memberikan ketajaman teks HiDPI / Retina penuh di ponsel)
  appState.pageFlipInstance = new PageFlip(dom.flipbookContainer, {
    width: pageWidth,
    height: pageHeight,
    size: 'fixed',
    minWidth: pageWidth,
    maxWidth: pageWidth,
    minHeight: pageHeight,
    maxHeight: pageHeight,
    showCover: true,
    usePortrait: isMobile,
    autoSize: true,
    maxShadowOpacity: 0.35,
    showPageCorners: !isMobile,
    flippingTime: 480,
    useMouseEvents: true,
    mobileScrollSupport: false,
    swipeDistance: 20,
  });

  // Siapkan elemen lembaran halaman HTML beresolusi tinggi
  const pageElements = imageUrls.map((url, idx) => {
    const pageEl = document.createElement('div');
    pageEl.className = 'flip-page-item';
    pageEl.dataset.density = (idx === 0 || idx === imageUrls.length - 1) ? 'hard' : 'soft';

    const img = document.createElement('img');
    img.src = url;
    img.alt = `Halaman ${idx + 1}`;
    img.draggable = false;
    pageEl.appendChild(img);

    return pageEl;
  });

  appState.pageFlipInstance.loadFromHTML(pageElements);

  // Penanganan saat lembaran halaman dibalik
  appState.pageFlipInstance.on('flip', (e) => {
    const pageIndex = typeof e.data === 'number' ? e.data : (appState.pageFlipInstance.getCurrentPageIndex() || 0);
    appState.currentPage = pageIndex + 1;
    dom.inputJumpPage.value = String(appState.currentPage);
    updateNavigationControls();
    audioService.playPageTurn();
    highlightActiveThumbnail(appState.currentPage);
  });

  // Sinkronisasi posisi halaman jika telah membaca ke halaman tertentu
  if (appState.currentPage > 1) {
    try {
      appState.pageFlipInstance.flip(appState.currentPage - 1);
    } catch {}
  }
}

// Menyiapkan lembaran buku digital untuk Flipbook dan Scroll
async function setupFlipbookContainer(numPages) {
  dom.flipbookContainer.innerHTML = '';
  dom.scrollPagesList.innerHTML = '';

  const imageUrls = [];

  for (let i = 1; i <= numPages; i++) {
    dom.loadingStatusText.textContent = `Menyiapkan lembaran: halaman ${i} dari ${numPages}...`;
    dom.loadingProgressBar.style.width = `${Math.round(20 + (i / numPages) * 75)}%`;

    const dataUrl = await pdfService.renderPageToImage(i, 1.8);
    imageUrls.push(dataUrl);

    // Siapkan elemen untuk Mode Scroll Vertikal
    const scrollItem = document.createElement('div');
    scrollItem.className = 'scroll-page-item';
    scrollItem.id = `scrollPage-${i}`;

    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = `Halaman ${i}`;
    img.loading = i > 3 ? 'lazy' : 'eager';
    scrollItem.appendChild(img);

    const badge = document.createElement('span');
    badge.className = 'scroll-page-number';
    badge.textContent = `Halaman ${i}`;
    scrollItem.appendChild(badge);

    dom.scrollPagesList.appendChild(scrollItem);
  }

  appState.pageImages = imageUrls;
  createOrUpdatePageFlip(imageUrls);

  appState.currentPage = 1;
  dom.inputJumpPage.value = '1';
  updateNavigationControls();
}

// Menyiapkan Bilah Cuplikan (Thumbnails)
async function setupThumbnails(numPages) {
  dom.thumbnailsList.innerHTML = '';

  for (let i = 1; i <= numPages; i++) {
    const card = document.createElement('div');
    card.className = `thumbnail-card ${i === 1 ? 'active' : ''}`;
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Buka Halaman ${i}`);
    card.dataset.page = String(i);

    const preview = document.createElement('div');
    preview.className = 'thumbnail-preview';
    const img = document.createElement('img');
    img.alt = `Cuplikan halaman ${i}`;
    preview.appendChild(img);

    const numSpan = document.createElement('span');
    numSpan.className = 'thumbnail-number';
    numSpan.textContent = String(i);

    card.appendChild(preview);
    card.appendChild(numSpan);
    dom.thumbnailsList.appendChild(card);

    // Klik untuk lompat ke halaman
    card.addEventListener('click', () => {
      jumpToPage(i);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        jumpToPage(i);
      }
    });

    // Ambil gambar thumbnail secara bertahap
    setTimeout(async () => {
      try {
        const thumbUrl = await pdfService.getPageThumbnail(i, 110);
        img.src = thumbUrl;
      } catch (e) {
        console.warn(`Thumbnail page ${i} error:`, e);
      }
    }, i * 60);
  }
}

function highlightActiveThumbnail(pageNumber) {
  const cards = dom.thumbnailsList.querySelectorAll('.thumbnail-card');
  cards.forEach(c => {
    if (c.dataset.page === String(pageNumber)) {
      c.classList.add('active');
      c.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      c.classList.remove('active');
    }
  });
}

// Navigasi Lompat Halaman
function jumpToPage(targetPage) {
  const page = Math.max(1, Math.min(targetPage, appState.totalPages));
  appState.currentPage = page;
  dom.inputJumpPage.value = String(page);

  if (appState.viewMode === 'flip' && appState.pageFlipInstance) {
    appState.pageFlipInstance.flip(page - 1);
  } else if (appState.viewMode === 'scroll') {
    const el = document.getElementById(`scrollPage-${page}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  highlightActiveThumbnail(page);
  updateNavigationControls();
}

function turnNextPage() {
  if (appState.currentPage < appState.totalPages) {
    if (appState.viewMode === 'flip' && appState.pageFlipInstance) {
      try {
        appState.pageFlipInstance.flipNext();
      } catch {
        jumpToPage(appState.currentPage + 1);
      }
    } else {
      jumpToPage(appState.currentPage + 1);
    }
  }
}

function turnPrevPage() {
  if (appState.currentPage > 1) {
    if (appState.viewMode === 'flip' && appState.pageFlipInstance) {
      try {
        appState.pageFlipInstance.flipPrev();
      } catch {
        jumpToPage(appState.currentPage - 1);
      }
    } else {
      jumpToPage(appState.currentPage - 1);
    }
  }
}

function updateNavigationControls() {
  const isFirst = appState.currentPage <= 1;
  const isLast = appState.currentPage >= appState.totalPages;

  dom.btnPrevPageFloating.disabled = isFirst;
  dom.btnNextPageFloating.disabled = isLast;
  dom.btnPrevPageFooter.disabled = isFirst;
  dom.btnNextPageFooter.disabled = isLast;
}

// Mode Tampilan: Flipbook vs Scroll
function setViewMode(mode) {
  appState.viewMode = mode;
  if (mode === 'flip') {
    dom.btnModeFlip.classList.add('active');
    dom.btnModeFlip.setAttribute('aria-pressed', 'true');
    dom.btnModeScroll.classList.remove('active');
    dom.btnModeScroll.setAttribute('aria-pressed', 'false');

    dom.flipbookWrapper.classList.remove('hidden');
    dom.scrollWrapper.classList.add('hidden');
    dom.btnPrevPageFloating.classList.remove('hidden');
    dom.btnNextPageFloating.classList.remove('hidden');

    if (appState.pageFlipInstance) {
      appState.pageFlipInstance.update();
    }
  } else {
    dom.btnModeScroll.classList.add('active');
    dom.btnModeScroll.setAttribute('aria-pressed', 'true');
    dom.btnModeFlip.classList.remove('active');
    dom.btnModeFlip.setAttribute('aria-pressed', 'false');

    dom.flipbookWrapper.classList.add('hidden');
    dom.scrollWrapper.classList.remove('hidden');
    dom.btnPrevPageFloating.classList.add('hidden');
    dom.btnNextPageFloating.classList.add('hidden');

    // Scroll ke halaman aktif saat ini
    const el = document.getElementById(`scrollPage-${appState.currentPage}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

// Pengaturan Zoom
function applyZoom(delta) {
  let newZoom = appState.zoomLevel + delta;
  newZoom = Math.max(0.75, Math.min(2.0, newZoom));
  appState.zoomLevel = Math.round(newZoom * 100) / 100;
  dom.zoomLevelText.textContent = `${Math.round(appState.zoomLevel * 100)}%`;

  if (appState.viewMode === 'flip') {
    dom.flipbookContainer.style.transform = `scale(${appState.zoomLevel})`;
    dom.flipbookContainer.style.transformOrigin = 'center center';
  } else {
    dom.scrollPagesList.style.transform = `scale(${appState.zoomLevel})`;
    dom.scrollPagesList.style.transformOrigin = 'top center';
  }
}

function resetZoom() {
  appState.zoomLevel = 1.0;
  dom.zoomLevelText.textContent = '100%';
  dom.flipbookContainer.style.transform = 'none';
  dom.scrollPagesList.style.transform = 'none';
}

// Audio Icon Toggle
function updateAudioIcon() {
  if (audioService.isMuted) {
    dom.iconAudioOn.classList.add('hidden');
    dom.iconAudioOff.classList.remove('hidden');
    dom.btnToggleAudio.title = 'Aktifkan Suara Kertas';
    dom.btnToggleAudio.setAttribute('aria-label', 'Aktifkan Suara Kertas');
  } else {
    dom.iconAudioOn.classList.remove('hidden');
    dom.iconAudioOff.classList.add('hidden');
    dom.btnToggleAudio.title = 'Bungkam Suara Kertas';
    dom.btnToggleAudio.setAttribute('aria-label', 'Bungkam Suara Kertas');
  }
}

// Menampilkan State UI
function showState(stateName) {
  dom.stateLoading.classList.add('hidden');
  dom.stateEmpty.classList.add('hidden');
  dom.stateError.classList.add('hidden');

  if (stateName === 'loading') dom.stateLoading.classList.remove('hidden');
  if (stateName === 'empty') dom.stateEmpty.classList.remove('hidden');
  if (stateName === 'error') dom.stateError.classList.remove('hidden');
}

function hideStates() {
  dom.stateLoading.classList.add('hidden');
  dom.stateEmpty.classList.add('hidden');
  dom.stateError.classList.add('hidden');
}

// Tampilkan Toast
function showToast(message) {
  dom.toastMessage.textContent = message;
  dom.toastNotification.classList.remove('hidden');
  clearTimeout(dom.toastTimeout);
  dom.toastTimeout = setTimeout(() => {
    dom.toastNotification.classList.add('hidden');
  }, 2600);
}

// ==========================================================================
// Modal QR Code & Bagikan
// ==========================================================================
function openQrModal() {
  const currentUrl = window.location.href;
  dom.inputShareUrl.value = currentUrl;
  renderQRCode(dom.qrCanvas, currentUrl);

  if (navigator.share) {
    dom.btnNativeShare.classList.remove('hidden');
  } else {
    dom.btnNativeShare.classList.add('hidden');
  }

  dom.modalQr.classList.remove('hidden');
  dom.btnCopyShareUrl.focus();
}

function closeQrModal() {
  dom.modalQr.classList.add('hidden');
  dom.btnOpenQrModal.focus();
}

// ==========================================================================
// Modal Admin & Pengelolaan Berkas PDF (YAS-01 dan YAS-08)
// ==========================================================================
function openAdminModal() {
  dom.modalAdmin.classList.remove('hidden');
  if (appState.adminAuthenticated) {
    showAdminPanel();
  } else {
    showAdminAuth();
  }
}

function closeAdminModal() {
  dom.modalAdmin.classList.add('hidden');
  dom.btnOpenAdminModal.focus();
}

function showAdminAuth() {
  dom.adminStepAuth.classList.remove('hidden');
  dom.adminStepPanel.classList.add('hidden');
  dom.inputAdminPin.value = '';
  dom.adminAuthError.classList.add('hidden');
  setTimeout(() => dom.inputAdminPin.focus(), 100);
}

function showAdminPanel() {
  dom.adminStepAuth.classList.add('hidden');
  dom.adminStepPanel.classList.remove('hidden');
  switchAdminTab('upload');
}

function switchAdminTab(tabName) {
  if (tabName === 'upload') {
    dom.tabBtnUpload.classList.add('active');
    dom.tabBtnUpload.setAttribute('aria-selected', 'true');
    dom.tabBtnSettings.classList.remove('active');
    dom.tabBtnSettings.setAttribute('aria-selected', 'false');
    dom.tabContentUpload.classList.remove('hidden');
    dom.tabContentSettings.classList.add('hidden');
  } else {
    dom.tabBtnSettings.classList.add('active');
    dom.tabBtnSettings.setAttribute('aria-selected', 'true');
    dom.tabBtnUpload.classList.remove('active');
    dom.tabBtnUpload.setAttribute('aria-selected', 'false');
    dom.tabContentSettings.classList.remove('hidden');
    dom.tabContentUpload.classList.add('hidden');
  }
}

// Memproses Berkas PDF yang Diunggah oleh Admin
async function handlePdfUpload(file) {
  if (!file) return;

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    alert('Berkas harus berupa dokumen dengan format PDF (.pdf).');
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    alert('Ukuran berkas melebihi batas maksimal 50 MB.');
    return;
  }

  try {
    const rawBuffer = await file.arrayBuffer();

    // Simpan salinan asli ArrayBuffer agar tidak detached oleh proses pembacaan worker
    appState.pendingPdfBuffer = rawBuffer.slice(0);
    appState.pendingPdfMeta = {
      name: file.name,
      pages: 0,
      size: file.size,
    };

    // Validasi apakah benar PDF yang dapat dibaca (menggunakan salinan kloning)
    const testService = new (pdfService.constructor)();
    const testPages = await testService.load(rawBuffer.slice(0));

    if (testPages < 1) {
      alert('Dokumen PDF kosong atau tidak memiliki halaman.');
      return;
    }

    appState.pendingPdfMeta.pages = testPages;

    // Tampilkan informasi berkas
    dom.previewFileName.textContent = file.name;
    dom.previewPageCount.textContent = `${testPages} Halaman`;
    dom.previewFileSize.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    // Render Pratinjau Tiga Titik Sesuai PRD Bab 8:
    // 1. Halaman Pertama (Sampul)
    await testService.renderPageToCanvas(1, dom.canvasPreviewFirst, { scale: 0.8 });

    // 2. Halaman Tengah
    const midPage = Math.floor(testPages / 2);
    await testService.renderPageToCanvas(midPage, dom.canvasPreviewMid, { scale: 0.8 });

    // 3. Halaman Terakhir
    await testService.renderPageToCanvas(testPages, dom.canvasPreviewLast, { scale: 0.8 });

    dom.previewSection.classList.remove('hidden');

  } catch (err) {
    console.error('Kendala membaca berkas PDF yang diunggah:', err);
    alert(`Berkas PDF tidak dapat dibaca: ${err.message || 'Format rusak'}.`);
  }
}

// ==========================================================================
// Event Listeners Binding
// ==========================================================================
function bindEventListeners() {
  // Dukungan Gestur Usap (Swipe) dan Ketukan Layar pada Ponsel
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  dom.flipbookWrapper.addEventListener('touchstart', (e) => {
    if (appState.viewMode !== 'flip') return;
    if (e.touches && e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }
  }, { passive: true });

  dom.flipbookWrapper.addEventListener('touchend', (e) => {
    if (appState.viewMode !== 'flip') return;
    if (e.changedTouches && e.changedTouches.length === 1) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;

      // 1. Deteksi usap horizontal (swipe) kiri atau kanan
      if (Math.abs(deltaX) > 35 && Math.abs(deltaY) < 75 && deltaTime < 450) {
        if (deltaX < 0) {
          turnNextPage();
        } else {
          turnPrevPage();
        }
        return;
      }

      // 2. Deteksi ketukan cepat (tap) di sisi kiri atau kanan layar ponsel
      if (Math.abs(deltaX) < 15 && Math.abs(deltaY) < 15 && deltaTime < 300) {
        const screenW = window.innerWidth;
        if (touchEndX > screenW * 0.65) {
          turnNextPage();
        } else if (touchEndX < screenW * 0.35) {
          turnPrevPage();
        }
      }
    }
  }, { passive: true });

  // Navigasi Balik Halaman
  dom.btnPrevPageFloating.addEventListener('click', turnPrevPage);
  dom.btnNextPageFloating.addEventListener('click', turnNextPage);
  dom.btnPrevPageFooter.addEventListener('click', turnPrevPage);
  dom.btnNextPageFooter.addEventListener('click', turnNextPage);

  // Input Lompat Halaman
  dom.inputJumpPage.addEventListener('change', (e) => {
    jumpToPage(parseInt(e.target.value, 10));
  });
  dom.inputJumpPage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      jumpToPage(parseInt(e.target.value, 10));
    }
  });

  // Tampilan Mode
  dom.btnModeFlip.addEventListener('click', () => setViewMode('flip'));
  dom.btnModeScroll.addEventListener('click', () => setViewMode('scroll'));

  // Zoom
  dom.btnZoomIn.addEventListener('click', () => applyZoom(0.2));
  dom.btnZoomOut.addEventListener('click', () => applyZoom(-0.2));
  dom.btnZoomReset.addEventListener('click', resetZoom);

  // Audio Mute Toggle
  dom.btnToggleAudio.addEventListener('click', () => {
    audioService.toggleMute();
    updateAudioIcon();
    showToast(audioService.isMuted ? 'Suara lembaran dibungkam' : 'Suara lembaran aktif');
  });

  // Layar Penuh
  dom.btnToggleFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Cuplikan (Thumbnails)
  dom.btnToggleThumbnails.addEventListener('click', () => {
    const isHidden = dom.thumbnailsDrawer.classList.contains('hidden');
    if (isHidden) {
      dom.thumbnailsDrawer.classList.remove('hidden');
      dom.btnToggleThumbnails.setAttribute('aria-expanded', 'true');
    } else {
      dom.thumbnailsDrawer.classList.add('hidden');
      dom.btnToggleThumbnails.setAttribute('aria-expanded', 'false');
    }
  });

  dom.btnCloseThumbnails.addEventListener('click', () => {
    dom.thumbnailsDrawer.classList.add('hidden');
    dom.btnToggleThumbnails.setAttribute('aria-expanded', 'false');
  });

  // Modal QR
  dom.btnOpenQrModal.addEventListener('click', openQrModal);
  dom.btnCloseQrModal.addEventListener('click', closeQrModal);
  dom.modalQr.addEventListener('click', (e) => {
    if (e.target === dom.modalQr) closeQrModal();
  });

  dom.btnCopyShareUrl.addEventListener('click', async () => {
    await copyPublicationLink(dom.inputShareUrl.value);
    showToast('Tautan publik berhasil disalin.');
  });

  dom.btnDownloadQr.addEventListener('click', () => {
    downloadQRCode(dom.qrCanvas, 'QR_Buku_Yasin_Digital.png');
    showToast('Berkas QR Code sedang diunduh.');
  });

  dom.btnNativeShare.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: appState.publicationTitle,
          text: `Bacaan ${appState.publicationTitle} - ${appState.publicationDedication}`,
          url: window.location.href,
        });
      } catch {
        // User membatalkan berbagi
      }
    }
  });

  // Modal Admin
  dom.btnOpenAdminModal.addEventListener('click', openAdminModal);
  dom.btnEmptyOpenAdmin.addEventListener('click', openAdminModal);
  dom.btnCloseAdminModal.addEventListener('click', closeAdminModal);
  dom.modalAdmin.addEventListener('click', (e) => {
    if (e.target === dom.modalAdmin) closeAdminModal();
  });

  // Form Otentikasi Admin
  dom.formAdminAuth.addEventListener('submit', () => {
    const enteredPin = dom.inputAdminPin.value.trim();
    const correctPin = getAdminPin();
    if (enteredPin === correctPin) {
      appState.adminAuthenticated = true;
      dom.adminAuthError.classList.add('hidden');
      showAdminPanel();
    } else {
      dom.adminAuthError.classList.remove('hidden');
    }
  });

  // Tab Admin
  dom.tabBtnUpload.addEventListener('click', () => switchAdminTab('upload'));
  dom.tabBtnSettings.addEventListener('click', () => switchAdminTab('settings'));

  // Drag and Drop & Input File
  dom.btnBrowseFile.addEventListener('click', () => dom.inputFilePdf.click());
  dom.inputFilePdf.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handlePdfUpload(e.target.files[0]);
    }
  });

  dom.uploadDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dom.uploadDropzone.classList.add('dragover');
  });

  dom.uploadDropzone.addEventListener('dragleave', () => {
    dom.uploadDropzone.classList.remove('dragover');
  });

  dom.uploadDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dom.uploadDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfUpload(e.dataTransfer.files[0]);
    }
  });

  // Tombol Terbitkan PDF Baru (YAS-01, YAS-08)
  dom.btnPublishNewPdf.addEventListener('click', async () => {
    if (!appState.pendingPdfBuffer) return;

    try {
      dom.btnPublishNewPdf.disabled = true;
      dom.btnPublishNewPdf.textContent = 'Menerbitkan...';

      const bufferToSave = appState.pendingPdfBuffer.slice(0);

      await saveActivePdf(bufferToSave, {
        name: appState.pendingPdfMeta.name,
        title: appState.publicationTitle,
        dedication: appState.publicationDedication,
      });

      appState.activePdfSource = appState.pendingPdfBuffer.slice(0);
      closeAdminModal();
      showToast('Publikasi PDF berhasil diperbarui.');

      await loadAndRenderDocument(appState.activePdfSource);
    } catch (err) {
      alert(`Gagal menerbitkan PDF: ${err.message}`);
    } finally {
      dom.btnPublishNewPdf.disabled = false;
      dom.btnPublishNewPdf.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Terbitkan PDF Ini untuk Pembaca</span>
      `;
    }
  });

  // Reset ke PDF Bawaan
  dom.btnResetToDefaultPdf.addEventListener('click', async () => {
    if (confirm('Kembalikan dokumen buku Yasin ke berkas contoh bawaan sistem?')) {
      await clearActivePdf();
      appState.activePdfSource = '/yasin-default.pdf';
      dom.previewSection.classList.add('hidden');
      closeAdminModal();
      showToast('Dokumen dikembalikan ke berkas bawaan.');
      await loadAndRenderDocument(appState.activePdfSource);
    }
  });

  // Simpan Informasi Publikasi & PIN
  dom.formPubSettings.addEventListener('submit', async () => {
    const newTitle = dom.inputPubTitle.value.trim();
    const newDedication = dom.inputPubDedication.value.trim();
    const newPin = dom.inputNewPin.value.trim();

    if (newTitle) appState.publicationTitle = newTitle;
    if (newDedication) appState.publicationDedication = newDedication;

    if (newPin) {
      setAdminPin(newPin);
      showToast('PIN pengelola berhasil diperbarui.');
    }

    updateHeaderMetadata();

    // Update di IndexedDB jika ada berkas aktif
    const active = await getActivePdf();
    if (active) {
      await saveActivePdf(active.buffer, {
        ...active,
        title: appState.publicationTitle,
        dedication: appState.publicationDedication,
      });
    }

    showToast('Informasi publikasi berhasil disimpan.');
    closeAdminModal();
  });

  // State Tombol Aksi Error & Empty
  dom.btnRetryLoad.addEventListener('click', () => {
    loadAndRenderDocument(appState.activePdfSource);
  });

  dom.btnErrorResetDefault.addEventListener('click', async () => {
    await clearActivePdf();
    appState.activePdfSource = '/yasin-default.pdf';
    await loadAndRenderDocument(appState.activePdfSource);
  });

  dom.btnLoadDefaultSample.addEventListener('click', async () => {
    appState.activePdfSource = '/yasin-default.pdf';
    await loadAndRenderDocument(appState.activePdfSource);
  });

  // Aksesibilitas Keyboard (R-32)
  window.addEventListener('keydown', (e) => {
    // Abaikan jika sedang mengetik di input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      turnNextPage();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      turnPrevPage();
    } else if (e.key === 'Home') {
      e.preventDefault();
      jumpToPage(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      jumpToPage(appState.totalPages);
    } else if (e.key === 'Escape') {
      if (!dom.modalQr.classList.contains('hidden')) closeQrModal();
      if (!dom.modalAdmin.classList.contains('hidden')) closeAdminModal();
      if (!dom.thumbnailsDrawer.classList.contains('hidden')) {
        dom.thumbnailsDrawer.classList.add('hidden');
        dom.btnToggleThumbnails.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Responsif Resize Window
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (appState.pageImages && appState.pageImages.length && appState.viewMode === 'flip') {
        createOrUpdatePageFlip(appState.pageImages);
      }
    }, 250);
  });
}

// Mulai aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', initApp);
