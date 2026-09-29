import QRCode from 'qrcode';

export async function renderQRCode(canvasElement, text) {
  if (!canvasElement) return;

  await QRCode.toCanvas(canvasElement, text, {
    width: 260,
    margin: 2,
    color: {
      dark: '#162E24', // Deep Slate Green
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });
}

export function downloadQRCode(canvasElement, filename = 'QR_Buku_Yasin_Digital.png') {
  if (!canvasElement) return;
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvasElement.toDataURL('image/png');
  link.click();
}

export async function copyPublicationLink(url = window.location.href) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(url);
    return true;
  }
  // Fallback
  const input = document.createElement('input');
  input.value = url;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  return true;
}
