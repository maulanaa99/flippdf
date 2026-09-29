import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function generateDefaultPdf() {
  const pdfDoc = await PDFDocument.create();
  
  const fontTimes = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontTimesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const primaryColor = rgb(0.086, 0.18, 0.14); // #162E24 Deep Slate Green
  const accentColor = rgb(0.72, 0.54, 0.29); // #B88B4A Muted Brass Gold
  const textColor = rgb(0.1, 0.12, 0.11); // #1A1E1C Deep Ink
  const mutedText = rgb(0.4, 0.43, 0.41);
  const parchmentBg = rgb(0.97, 0.96, 0.93); // #F7F4EE

  const pageWidth = 595.28; // A4 portrait / proportional standard book
  const pageHeight = 841.89;

  function drawDecorativeBorder(page, isCover = false) {
    // Background fill
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: isCover ? primaryColor : parchmentBg,
    });

    const margin = isCover ? 28 : 36;
    const innerMargin = isCover ? 34 : 42;
    const borderColor = isCover ? accentColor : rgb(0.88, 0.84, 0.79);
    const innerBorderColor = isCover ? rgb(0.85, 0.70, 0.45) : accentColor;

    // Outer border
    page.drawRectangle({
      x: margin,
      y: margin,
      width: pageWidth - margin * 2,
      height: pageHeight - margin * 2,
      borderColor: borderColor,
      borderWidth: isCover ? 2 : 1.5,
    });

    // Inner border
    page.drawRectangle({
      x: innerMargin,
      y: innerMargin,
      width: pageWidth - innerMargin * 2,
      height: pageHeight - innerMargin * 2,
      borderColor: innerBorderColor,
      borderWidth: 0.75,
    });

    // Corner decorative diamonds
    const corners = [
      { x: margin, y: margin },
      { x: pageWidth - margin, y: margin },
      { x: margin, y: pageHeight - margin },
      { x: pageWidth - margin, y: pageHeight - margin },
    ];
    corners.forEach(c => {
      page.drawRectangle({
        x: c.x - 4,
        y: c.y - 4,
        width: 8,
        height: 8,
        color: innerBorderColor,
      });
    });
  }

  // --- HALAMAN 1: SAMPUL DEPAN ---
  const p1 = pdfDoc.addPage([pageWidth, pageHeight]);
  drawDecorativeBorder(p1, true);

  p1.drawText('SURAT YASIN', {
    x: 160,
    y: 560,
    size: 34,
    font: fontTimesBold,
    color: rgb(0.96, 0.93, 0.86),
  });
  p1.drawText('& TAHLIL', {
    x: 215,
    y: 515,
    size: 28,
    font: fontTimesBold,
    color: accentColor,
  });

  p1.drawText('Dilengkapi Bacaan Doa, Transliterasi Latin, dan Terjemahan', {
    x: 130,
    y: 440,
    size: 13,
    font: fontTimesItalic,
    color: rgb(0.82, 0.85, 0.83),
  });

  // Garis ornamen tengah
  p1.drawLine({
    start: { x: 180, y: 390 },
    end: { x: 415, y: 390 },
    thickness: 1,
    color: accentColor,
  });

  p1.drawText('Mengenang Almarhum / Almarhumah', {
    x: 175,
    y: 350,
    size: 14,
    font: fontTimes,
    color: rgb(0.9, 0.9, 0.88),
  });

  p1.drawText('Semoga amal ibadahnya diterima di sisi Allah SWT', {
    x: 148,
    y: 320,
    size: 12,
    font: fontTimesItalic,
    color: rgb(0.75, 0.78, 0.76),
  });

  p1.drawText('Edisi Publikasi Digital Keluarga', {
    x: 215,
    y: 100,
    size: 11,
    font: fontHelvetica,
    color: rgb(0.65, 0.7, 0.67),
  });

  // Helper untuk halaman isi
  function createContentPage(title, subtitle, pageNumber) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    drawDecorativeBorder(page, false);

    // Header judul
    page.drawText(title, {
      x: 70,
      y: 760,
      size: 18,
      font: fontTimesBold,
      color: primaryColor,
    });

    if (subtitle) {
      page.drawText(subtitle, {
        x: 70,
        y: 742,
        size: 10,
        font: fontHelvetica,
        color: accentColor,
      });
    }

    page.drawLine({
      start: { x: 70, y: 730 },
      end: { x: pageWidth - 70, y: 730 },
      thickness: 0.8,
      color: rgb(0.85, 0.8, 0.75),
    });

    // Nomor halaman
    page.drawText(String(pageNumber), {
      x: pageWidth / 2 - 6,
      y: 52,
      size: 10,
      font: fontHelvetica,
      color: mutedText,
    });

    return page;
  }

  // --- HALAMAN 2: DAFTAR ISI ---
  const p2 = createContentPage('DAFTAR ISI & PANDUAN BACA', 'Publikasi Buku Yasin Digital', 2);
  const tocItems = [
    { title: 'Surat Al-Fatihah', desc: 'Pembukaan dan fadhilah', page: '3' },
    { title: 'Surat Yasin (Ayat 1 - 27)', desc: 'Peringatan kerasulan dan kisah ashhabul qaryah', page: '4 - 5' },
    { title: 'Surat Yasin (Ayat 28 - 54)', desc: 'Tanda-tanda kekuasaan Allah dan tiupan sangkakala', page: '6 - 7' },
    { title: 'Surat Yasin (Ayat 55 - 83)', desc: 'Nikmat surga, hari kebangkitan, dan penutup surat', page: '8 - 10' },
    { title: 'Doa Setelah Membaca Surat Yasin', desc: 'Doa permohonan keselamatan dan ampunan', page: '11 - 12' },
    { title: 'Susunan Bacaan Tahlil', desc: 'Istighfar, tahlil, tasbih, dan shalawat', page: '13' },
    { title: 'Doa Tahlil & Khusus Ahli Kubur', desc: 'Pengiriman doa untuk arwah dan penutup', page: '14 - 15' },
  ];

  let y = 680;
  tocItems.forEach((item, idx) => {
    p2.drawText(`${idx + 1}.  ${item.title}`, { x: 75, y, size: 12, font: fontTimesBold, color: primaryColor });
    p2.drawText(item.desc, { x: 95, y: y - 16, size: 10, font: fontTimesItalic, color: mutedText });
    p2.drawText(`Halaman ${item.page}`, { x: 440, y, size: 11, font: fontHelveticaBold, color: accentColor });
    y -= 50;
  });

  p2.drawRectangle({
    x: 75,
    y: 120,
    width: pageWidth - 150,
    height: 100,
    color: rgb(0.93, 0.91, 0.87),
    borderColor: rgb(0.85, 0.8, 0.75),
    borderWidth: 1,
  });
  p2.drawText('PETUNJUK MEMBACA PADA PERANGKAT:', { x: 90, y: 195, size: 10, font: fontHelveticaBold, color: primaryColor });
  p2.drawText('• Geser atau klik tepi halaman untuk membalik lembaran buku.', { x: 90, y: 175, size: 9, font: fontHelvetica, color: textColor });
  p2.drawText('• Gunakan tombol zoom di bilah atas untuk memperbesar teks ayat bila diperlukan.', { x: 90, y: 158, size: 9, font: fontHelvetica, color: textColor });
  p2.drawText('• Beralih ke Mode Scroll Vertikal melalui menu jika lebih nyaman di ponsel.', { x: 90, y: 141, size: 9, font: fontHelvetica, color: textColor });

  // --- HALAMAN 3: SURAT AL-FATIHAH ---
  const p3 = createContentPage('SURAT AL-FATIHAH (PEMBUKAAN)', '7 Ayat : Diturunkan di Makkah', 3);
  p3.drawText('Bismillaahir-rohmaanir-rohiim', { x: 210, y: 690, size: 14, font: fontTimesBold, color: accentColor });
  p3.drawText('Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang', { x: 145, y: 672, size: 10, font: fontTimesItalic, color: mutedText });

  const fatihahVerses = [
    { no: '1', ar: 'Bismillaahir-rohmaanir-rohiim.', id: 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.' },
    { no: '2', ar: 'Al-hamdu lillaahi robbil-\'aalamiin.', id: 'Segala puji bagi Allah, Tuhan semesta alam.' },
    { no: '3', ar: 'Ar-rohmaanir-rohiim.', id: 'Maha Pengasih lagi Maha Penyayang.' },
    { no: '4', ar: 'Maaliki yaumid-diin.', id: 'Pemilik hari pembalasan.' },
    { no: '5', ar: 'Iyyaaka na\'budu wa iyyaaka nasta\'iin.', id: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami mohon pertolongan.' },
    { no: '6', ar: 'Ihdinash-shiroothal-mustaqiim.', id: 'Tunjukilah kami jalan yang lurus.' },
    { no: '7', ar: 'Shiroothol-ladziina an\'amta \'alaihim ghoiril-maghdhuubi \'alaihim wa ladh-dhoolliin. Aamiin.', id: '(Yaitu) jalan orang-orang yang telah Engkau beri nikmat, bukan (jalan) mereka yang dimurkai dan bukan (pula jalan) mereka yang sesat.' },
  ];

  y = 630;
  fatihahVerses.forEach(v => {
    p3.drawCircle({ x: 88, y: y + 4, size: 9, color: accentColor });
    p3.drawText(v.no, { x: 85, y, size: 9, font: fontHelveticaBold, color: rgb(1, 1, 1) });
    p3.drawText(v.ar, { x: 108, y, size: 12, font: fontTimesBold, color: primaryColor });
    p3.drawText(v.id, { x: 108, y: y - 18, size: 9.5, font: fontTimesItalic, color: textColor });
    y -= 52;
  });

  // --- HALAMAN 4 SAMPAI 10: SURAT YASIN (83 Ayat) ---
  const yasinSections = [
    {
      page: 4,
      title: 'SURAT YASIN (AYAT 1 - 12)',
      verses: [
        { no: '1', ar: 'Yaa Siiin.', id: 'Yaa Siin.' },
        { no: '2', ar: 'Wal-qur-aanil-hakiim.', id: 'Demi Al-Qur\'an yang penuh hikmah.' },
        { no: '3', ar: 'Innaka laminal-mursaliin.', id: 'Sungguh, engkau (Muhammad) benar-benar salah seorang rasul.' },
        { no: '4', ar: '\'Alaa shiroothim-mustaqiim.', id: '(yang berada) di atas jalan yang lurus.' },
        { no: '5', ar: 'Tanziilal-\'aziizir-rohiim.', id: '(Sebagai wahyu) yang diturunkan oleh Yang Maha Perkasa lagi Maha Penyayang.' },
        { no: '6', ar: 'Li tundziro qoumam-maa undziro aabaaa-uhum fa hum ghoofiluun.', id: 'Agar engkau memberi peringatan kepada kaum yang nenek moyangnya belum pernah diberi peringatan, karena itu mereka lalai.' },
        { no: '7', ar: 'Laqod haqqol-qoulu \'alaaa ak-tsarihim fa hum laa yu\'minuun.', id: 'Sungguh, pasti berlaku perkataan (hukuman) terhadap kebanyakan mereka, maka mereka tidak akan beriman.' },
        { no: '8', ar: 'Innaa ja\'alnaa fiii a\'naaqihim aghlaalan fa hiya ilal-adz-qooni fa hum muqmahuun.', id: 'Sungguh, Kami telah memasang belenggu di leher mereka, lalu tangan mereka (diangkat) ke dagu, karena itu mereka tertengadah.' },
        { no: '9', ar: 'Wa ja\'alnaa mim-baini aidiihim saddaw-wa min kholfihim saddan fa aghsyainaahum fa hum laa yubshiruun.', id: 'Dan Kami jadikan di hadapan mereka sekat dan di belakang mereka sekat (pula), dan Kami tutup (mata) mereka sehingga mereka tidak dapat melihat.' },
        { no: '10', ar: 'Wa sawaaa-un \'alaihim a-andzartahum am lam tundzirhum laa yu\'minuun.', id: 'Dan sama saja bagi mereka, apakah engkau memberi peringatan kepada mereka atau engkau tidak memberi peringatan, mereka tidak akan beriman.' },
        { no: '11', ar: 'Innamaa tundziru manittaba\'adz-dzikro wa khoshyar-rohmaana bil-ghoib...', id: 'Sesungguhnya engkau hanya memberi peringatan kepada orang-orang yang mau mengikuti peringatan dan yang takut kepada Tuhan Yang Maha Pengasih...' },
        { no: '12', ar: 'Innaa nahnu nuhyil-mautaa wa naktubu maa qoddamuu wa aatsaarohum...', id: 'Sungguh, Kamilah yang menghidupkan orang-orang mati dan Kamilah yang mencatat apa yang telah mereka kerjakan dan bekas-bekas yang mereka tinggalkan...' },
      ]
    },
    {
      page: 5,
      title: 'SURAT YASIN (AYAT 13 - 27)',
      verses: [
        { no: '13', ar: 'Wadhrib lahum matsalan ash-haabal-qoryati idz jaaa-ahal-mursaluun.', id: 'Dan buatlah suatu perumpamaan bagi mereka, yaitu penduduk suatu negeri ketika utusan-utusan datang kepada mereka.' },
        { no: '14', ar: 'Idz arsalnaaa ilaihimuts-naini fa kadz-dzabuuhumaa fa \'azzaznaa bi tsaalits...', id: '(yaitu) ketika Kami mengutus kepada mereka dua orang utusan, lalu mereka mendustakan keduanya; kemudian Kami kuatkan dengan utusan yang ketiga...' },
        { no: '15-18', ar: 'Qooluu maaa antum illaa basyarum-mitslunaa wa maaa anzalar-rohmaanu min syaii...', id: 'Mereka (penduduk negeri) berkata, Kamu ini hanyalah manusia seperti kami...' },
        { no: '19-21', ar: 'Qooluu thooo-irukum ma\'akum, a-in dzukkirtum, bal antum qoumum-musrifuun...', id: 'Utusan-utusan itu berkata, Kemalangan kamu adalah karena kamu sendiri...' },
        { no: '22-25', ar: 'Wa maa liya laaa a\'budul-ladzii fathoronii wa ilaihi turja\'uun...', id: 'Dan tidak ada alasan bagiku untuk tidak menyembah Tuhan yang telah menciptakanku...' },
        { no: '26-27', ar: 'Qiilad-khulil-jannata qoola yaa laita qoumii ya\'lamuun. Bimaa ghofaro lii robbii...', id: 'Dikatakan (kepadanya), Masuklah ke surga. Dia berkata, Alangkah baiknya sekiranya kaumku mengetahui apa yang menyebabkan Tuhanku memberi ampun kepadaku...' },
      ]
    },
    {
      page: 6,
      title: 'SURAT YASIN (AYAT 28 - 40)',
      verses: [
        { no: '28-30', ar: 'Wa maaa anzalnaa \'alaa qoumihii mim-ba\'dihii min jundim-minas-samaaa-i...', id: 'Dan setelah dia (meninggal), Kami tidak menurunkan suatu pasukan pun dari langit kepada kaumnya...' },
        { no: '31-33', ar: 'A-lam yarou kam ahlaknaa qoblahum minal-quruuni annahum ilaihim laa yarji\'uun...', id: 'Tidakkah mereka mengetahui berapa banyak umat sebelum mereka yang telah Kami binasakan...' },
        { no: '34-36', ar: 'Subhaanalladzii kholaqol-azwaaja kullahaa mimmaa tumbitul-ardhu...', id: 'Maha Suci Tuhan yang telah menciptakan semuanya berpasang-pasangan, baik dari apa yang ditumbuhkan oleh bumi...' },
        { no: '37-40', ar: 'Wasy-syamsu tajrii li mustaqorril-lahaa, dzaalika taqdiirul-\'aziizil-\'aliim...', id: 'Dan matahari berjalan di tempat peredarannya. Demikianlah ketetapan Yang Maha Perkasa lagi Maha Mengetahui...' },
      ]
    },
    {
      page: 7,
      title: 'SURAT YASIN (AYAT 41 - 54)',
      verses: [
        { no: '41-44', ar: 'Wa aayatul-lahum annaa hamalnaa dzurriyyatahum fil-fulkil-masy-huun...', id: 'Dan suatu tanda (kebesaran Allah) bagi mereka adalah bahwa Kami angkut keturunan mereka dalam kapal yang penuh muatan...' },
        { no: '45-48', ar: 'Wa idzaa qiila lahumut-taquu maa baina aidiikum wa maa kholfakum...', id: 'Dan apabila dikatakan kepada mereka: Takutlah kamu akan siksa yang di hadapanmu dan siksa yang akan datang...' },
        { no: '49-51', ar: 'Maa yanzhuruuna illaa shoihataw-waahidatan ta\'khudzuhum wa hum yakhish-shimuun...', id: 'Mereka hanya menunggu satu teriakan saja yang akan membinasakan mereka ketika mereka sedang bertengkar...' },
        { no: '52-54', ar: 'Qooluu yaa wailanaa mam-ba\'atsanaa mim-marqodinaa, haadzaa maa wa\'adar-rohmaanu...', id: 'Mereka berkata: Celakalah kami! Siapakah yang membangkitkan kami dari tempat tidur kami (kubur)? Inilah yang dijanjikan Tuhan Yang Maha Pengasih...' },
      ]
    },
    {
      page: 8,
      title: 'SURAT YASIN (AYAT 55 - 67)',
      verses: [
        { no: '55-58', ar: 'Inna ash-haabal-jannatil-yauma fii syughulin faakihuun. Salaamun qoulam-mir-robbir-rohiim.', id: 'Sungguh, penghuni surga pada hari itu bersenang-senang dalam kesibukan (mereka). (Kepada mereka dikatakan), Salam, sebagai ucapan selamat dari Tuhan Yang Maha Penyayang.' },
        { no: '59-62', ar: 'Wamtaazul-yauma ayyuhal-mujrimuun. A-lam a\'had ilaikum yaa baniii Aadama...', id: 'Dan (dikatakan kepada orang-orang kafir), Berpisahlah kamu (dari orang-orang mukmin) pada hari ini, wahai orang-orang yang berdosa! Bukankah Aku telah memerintahkan kepadamu wahai anak cucu Adam agar kamu tidak menyembah setan?' },
        { no: '63-65', ar: 'Al-yauma nakhtimu \'alaaa afwaahihim wa tukallimunaaa aidiihim wa tasy-hadu arjuluhum...', id: 'Pada hari ini Kami tutup mulut mereka; tangan mereka akan berkata kepada Kami dan kaki mereka akan memberi kesaksian terhadap apa yang dahulu mereka kerjakan.' },
        { no: '66-67', ar: 'Wa lau nasyaaa-u lathomasnaa \'alaaa a\'yunihim fastabaqush-shirootho fa-annaa yubshiruun...', id: 'Dan jika Kami menghendaki, pastilah Kami hapuskan penglihatan mata mereka; lalu mereka berlomba-lomba (mencari) jalan. Maka bagaimanakah mereka dapat melihat?' },
      ]
    },
    {
      page: 9,
      title: 'SURAT YASIN (AYAT 68 - 76)',
      verses: [
        { no: '68-70', ar: 'Wa man-nu\'ammirhu nunakkis-hu fil-kholqi, a-falaa ya\'qiluun. Wa maa \'allamnaahusy-syi\'ro...', id: 'Dan barangsiapa Kami panjangkan umurnya niscaya Kami kembalikan dia kepada awal kejadiannya. Maka apakah mereka tidak mengerti? Dan Kami tidak mengajarkan syair kepadanya (Muhammad)...' },
        { no: '71-73', ar: 'A-wa lam yarou annaa kholaqnaa lahum mimmaa \'amilat aidiinaaa an\'aaman fa hum lahaa maalikuun...', id: 'Dan tidakkah mereka melihat bahwa Kami telah menciptakan hewan ternak untuk mereka dari sebagian apa yang telah Kami ciptakan dengan kekuasaan Kami...' },
        { no: '74-76', ar: 'Wattakhadzuu min duunillaahi aalihatal-la\'allahum yunshoruun. Laa yastathii\'uuna nashrohum...', id: 'Dan mereka mengambil sesembahan selain Allah agar mereka mendapat pertolongan. Mereka (sesembahan itu) tidak dapat menolong mereka...' },
      ]
    },
    {
      page: 10,
      title: 'SURAT YASIN (AYAT 77 - 83)',
      verses: [
        { no: '77-79', ar: 'A-wa lam yarol-insaanu annaa kholaqnaahu min nuthfatin fa idzaa huwa khoshiimum-mubiin...', id: 'Dan tidakkah manusia memperhatikan bahwa Kami menciptakannya dari setetes mani, ternyata dia menjadi musuh yang nyata! Dan dia membuat perumpamaan bagi Kami dan melupakan kejadiannya...' },
        { no: '80-81', ar: 'Alladzii ja\'ala lakum minasy-syajaril-akhdhari naaron fa idzaaa antum minhu tuuqiduun...', id: '(Yaitu Tuhan) yang menjadikan api untukmu dari kayu yang hijau, maka seketika itu kamu menyalakan (api) dari kayu itu...' },
        { no: '82', ar: 'Innamaaa amruhuuu idzaaa arooda syai-an ay-yaquula lahuu KUN FA YAKUUN.', id: 'Sesungguhnya urusan-Nya apabila Dia menghendaki sesuatu hanyalah berkata kepadanya: JADILAH! Maka jadilah ia.' },
        { no: '83', ar: 'Fa subhaanalladzii bi yadihii malakuutu kulli syai-iw-wa ilaihi turja\'uun.', id: 'Maka Maha Suci (Allah) yang di tangan-Nya kekuasaan atas segala sesuatu dan kepada-Nya kamu dikembalikan.' },
      ]
    }
  ];

  yasinSections.forEach(sec => {
    const p = createContentPage(sec.title, 'Surat Yasin Makkiyyah', sec.page);
    let curY = 680;
    sec.verses.forEach(v => {
      p.drawCircle({ x: 86, y: curY + 4, size: 8.5, color: accentColor });
      p.drawText(v.no, { x: 82, y: curY, size: 8, font: fontHelveticaBold, color: rgb(1, 1, 1) });
      p.drawText(v.ar, { x: 104, y: curY, size: 11, font: fontTimesBold, color: primaryColor });
      p.drawText(v.id, { x: 104, y: curY - 16, size: 9, font: fontTimesItalic, color: textColor });
      curY -= 48;
    });
  });

  // --- HALAMAN 11 & 12: DOA SETELAH BACA SURAT YASIN ---
  const p11 = createContentPage('DOA SETELAH SURAT YASIN (1)', 'Permohonan Rahmat dan Keselamatan', 11);
  const p11Texts = [
    {
      label: 'Muqaddimah & Pujian',
      ar: 'Al-hamdu lillaahi robbil-\'aalamiin. Hamdan yuwaafii ni\'amahuu wa yukaafi-u maziidah.',
      id: 'Segala puji bagi Allah Tuhan semesta alam, pujian yang sebanding dengan nikmat-nikmat-Nya dan menjamin tambahannya.'
    },
    {
      label: 'Shalawat atas Nabi Muhammad SAW',
      ar: 'Alloohumma sholli wa sallim \'alaa sayyidinaa Muhammadin wa \'alaa aali sayyidinaa Muhammad.',
      id: 'Ya Allah, limpahkanlah rahmat dan keselamatan kepada junjungan kami Nabi Muhammad beserta keluarganya.'
    },
    {
      label: 'Permohonan Penjagaan Agama dan Iman',
      ar: 'Alloohumma innaa nastahfizhuka wa nastaudi\'uka adyaananaa wa anfusanaa wa ahlanaa wa amwaalanaa.',
      id: 'Ya Allah, sesungguhnya kami memohon perlindungan kepada-Mu dan kami menitipkan kepada-Mu agama kami, jiwa kami, keluarga kami, dan harta benda kami.'
    },
    {
      label: 'Perlindungan dari Segala Keburukan',
      ar: 'Alloohummaj-\'alnaa fii kanafika wa amaanika wa jiwaarika wa \'iyaadzika min kulli syaithoonim-mariid.',
      id: 'Ya Allah, jadikanlah kami berada dalam pemeliharaan-Mu, keamanan-Mu, dan perlindungan-Mu dari setiap gangguan setan yang durhaka.'
    }
  ];
  let py = 680;
  p11Texts.forEach(item => {
    p11.drawText(item.label, { x: 80, y: py, size: 11, font: fontHelveticaBold, color: accentColor });
    p11.drawText(item.ar, { x: 80, y: py - 18, size: 11, font: fontTimesBold, color: primaryColor });
    p11.drawText(item.id, { x: 80, y: py - 36, size: 9.5, font: fontTimesItalic, color: textColor });
    py -= 65;
  });

  const p12 = createContentPage('DOA SETELAH SURAT YASIN (2)', 'Permohonan Husnul Khatimah', 12);
  const p12Texts = [
    {
      label: 'Keindahan Takwa dan Istiqamah',
      ar: 'Alloohumma jammilnaa bil-\'aafiyati was-salaamah, wa haqqiqnaa bit-taqwaa wal-istiqoomah.',
      id: 'Ya Allah, indahkanlah kami dengan kesehatan dan keselamatan, serta kokohkanlah kami dengan ketakwaan dan keistiqamahan.'
    },
    {
      label: 'Perlindungan dari Penyesalan',
      ar: 'Wa a\'idznaa mim-muujibaatin-nadaamati innaka samii\'ud-du\'aaa\'.',
      id: 'Dan lindungilah kami dari hal-hal yang mendatangkan penyesalan, sesungguhnya Engkau Maha Mendengar segala doa.'
    },
    {
      label: 'Ampunan untuk Orang Tua dan Kaum Muslimin',
      ar: 'Alloohummaghfir lanaa wa li-waalidiinaa wa li-masyaayikhinaa wa li-jamii\'il-muslimiina wal-muslimaati wal-mu\'miniina wal-mu\'minaat.',
      id: 'Ya Allah, ampunilah dosa-dosa kami, orang tua kami, guru-guru kami, serta seluruh kaum muslimin dan muslimat, mukminin dan mukminat.'
    },
    {
      label: 'Penutup Doa',
      ar: 'Wa shollalloohu \'alaa sayyidinaa Muhammadin wa \'alaa aalihii wa shohbihii ajma\'iin. Wal-hamdu lillaahi robbil-\'aalamiin.',
      id: 'Dan semoga Allah melimpahkan rahmat kepada Nabi Muhammad beserta keluarga dan sahabatnya. Segala puji bagi Allah Tuhan semesta alam.'
    }
  ];
  py = 680;
  p12Texts.forEach(item => {
    p12.drawText(item.label, { x: 80, y: py, size: 11, font: fontHelveticaBold, color: accentColor });
    p12.drawText(item.ar, { x: 80, y: py - 18, size: 11, font: fontTimesBold, color: primaryColor });
    p12.drawText(item.id, { x: 80, y: py - 36, size: 9.5, font: fontTimesItalic, color: textColor });
    py -= 65;
  });

  // --- HALAMAN 13: BACAAN TAHLIL & DZIKIR ---
  const p13 = createContentPage('BACAAN TAHLIL & DZIKIR', 'Rangkaian Bacaan Tahlil Singkat', 13);
  const tahlilItems = [
    { dzikir: 'Astaghfirulloohal-\'azhiim (3x)', arti: 'Aku mohon ampun kepada Allah Yang Maha Agung.' },
    { dzikir: 'Afdholudz-dzikri fa\'lam annahuu: Laa ilaaha illallooh (33x)', arti: 'Ketahuilah dzikir yang paling utama: Tiada Tuhan selain Allah.' },
    { dzikir: 'Laa ilaaha illalloohu Muhammadur-rosuulullooh', arti: 'Tiada Tuhan selain Allah, Nabi Muhammad adalah utusan Allah.' },
    { dzikir: 'Subhaanalloohi wa bihamdihii, Subhaanalloohil-\'azhiim (33x)', arti: 'Maha Suci Allah dengan segala puji-Nya, Maha Suci Allah Yang Maha Agung.' },
    { dzikir: 'Alloohumma sholli \'alaa habiibika sayyidinaa Muhammadin wa aalihii wa shohbihii wa sallim (3x)', arti: 'Ya Allah limpahkan rahmat dan keselamatan kepada kekasih-Mu junjungan kami Nabi Muhammad...' },
  ];
  py = 680;
  tahlilItems.forEach((t, i) => {
    p13.drawText(`${i + 1}.  ${t.dzikir}`, { x: 80, y: py, size: 11.5, font: fontTimesBold, color: primaryColor });
    p13.drawText(t.arti, { x: 96, y: py - 18, size: 9.5, font: fontTimesItalic, color: mutedText });
    py -= 50;
  });

  // --- HALAMAN 14: DOA TAHLIL ARWAH (1) ---
  const p14 = createContentPage('DOA TAHLIL / ARWAH (BAGIAN 1)', 'Pengiriman Pahala Bacaan', 14);
  const p14Texts = [
    {
      label: 'Penyampaian Pahala kepada Baginda Rasulullah SAW',
      ar: 'Alloohumma awshil tsawaaba maa qoro\'naahu minal-qur-aanil-\'azhiim wa maa hallalnaa wa maa sabbahnaa ilaa hadhrotin-nabiyyi Muhammadin SAW.',
      id: 'Ya Allah, sampaikanlah pahala Al-Qur\'an yang kami baca, bacaan tahlil kami, dan tasbih kami kepada junjungan kami Nabi Muhammad SAW.'
    },
    {
      label: 'Kepada Para Nabi, Syuhada, dan Shalihin',
      ar: 'Tsumma ilaa arwaahi aabaaa-ihii wa ikhwaanihii minal-ambiyaaa-i wal-mursaliin wash-syuhadaaa-i wash-shoolihiin.',
      id: 'Kemudian kepada arwah para nabi, rasul, para syuhada, dan orang-orang shalih.'
    },
    {
      label: 'Kepada Kaum Muslimin di Alam Barzakh',
      ar: 'Tsumma ilaa jamii\'i ahlil-qubuuri minal-muslimiina wal-muslimaati min masyaariqil-ardhi ilaa maghooribihaa.',
      id: 'Kemudian kepada seluruh ahli kubur dari kaum muslimin dan muslimat dari timur hingga ke barat.'
    }
  ];
  py = 680;
  p14Texts.forEach(item => {
    p14.drawText(item.label, { x: 80, y: py, size: 11, font: fontHelveticaBold, color: accentColor });
    p14.drawText(item.ar, { x: 80, y: py - 20, size: 10.5, font: fontTimesBold, color: primaryColor });
    p14.drawText(item.id, { x: 80, y: py - 38, size: 9.5, font: fontTimesItalic, color: textColor });
    py -= 70;
  });

  // --- HALAMAN 15: DOA KHUSUS AHLI KUBUR & PENUTUP ---
  const p15 = createContentPage('DOA KHUSUS AHLI KUBUR (2)', 'Doa Ampunan dan Tempat di Surga', 15);
  const p15Texts = [
    {
      label: 'Doa Khusus Almarhum / Almarhumah',
      ar: 'Alloohummagh-fir lahuu (lahaa) war-hamhu (haa) wa \'aafihii (haa) wa\'fu \'anhu (haa).',
      id: 'Ya Allah, ampunilah dia, rahmatilah dia, selamatkanlah dia, dan maafkanlah kesalahannya.'
    },
    {
      label: 'Menerangi dan Melapangkan Kubur',
      ar: 'Alloohumma anzilir-rohmata wal-maghfirota \'alaa ahli qubuur, wa nwwir qubuurohum bi nuurika yaa Arhamar-Roohimiin.',
      id: 'Ya Allah, turunkanlah rahmat dan ampunan bagi ahli kubur, dan terangilah kuburnya dengan cahaya-Mu wahai Yang Maha Penyayang.'
    },
    {
      label: 'Jadikan Kubur sebagai Taman Surga',
      ar: 'Alloohummaj-\'al qobrohuu (qobrohaa) roudhotam-min riyaadhil-jinaan, wa laa taj-\'alhu hufrotam-min huforin-niiraan.',
      id: 'Ya Allah, jadikanlah kuburnya sebagai taman di antara taman-taman surga, dan jangan jadikan kuburnya jurang di antara jurang-jurang neraka.'
    },
    {
      label: 'Doa Penutup Keselamatan Dunia Akhirat',
      ar: 'Robbanaa aatinaa fid-dun-yaa hasanah wa fil-aakhiroti hasanataw-wa qinaa \'adzaaban-naar. Wal-hamdu lillaahi robbil-\'aalamiin.',
      id: 'Wahai Tuhan kami, berikanlah kepada kami kebaikan di dunia dan kebaikan di akhirat, serta lindungilah kami dari siksa neraka. Segala puji bagi Allah Tuhan semesta alam.'
    }
  ];
  py = 680;
  p15Texts.forEach(item => {
    p15.drawText(item.label, { x: 80, y: py, size: 11, font: fontHelveticaBold, color: accentColor });
    p15.drawText(item.ar, { x: 80, y: py - 18, size: 10.5, font: fontTimesBold, color: primaryColor });
    p15.drawText(item.id, { x: 80, y: py - 36, size: 9.5, font: fontTimesItalic, color: textColor });
    py -= 65;
  });

  // --- HALAMAN 16: SAMPUL BELAKANG ---
  const p16 = pdfDoc.addPage([pageWidth, pageHeight]);
  drawDecorativeBorder(p16, true);

  p16.drawText('INNAA LILLAAHI WA INNAA ILAIHI ROOJI\'UUN', {
    x: 120,
    y: 520,
    size: 16,
    font: fontTimesBold,
    color: rgb(0.96, 0.93, 0.86),
  });

  p16.drawText('"Sesungguhnya kami adalah milik Allah, dan kepada-Nya kami kembali."', {
    x: 115,
    y: 480,
    size: 12,
    font: fontTimesItalic,
    color: accentColor,
  });

  p16.drawLine({
    start: { x: 180, y: 440 },
    end: { x: 415, y: 440 },
    thickness: 1,
    color: accentColor,
  });

  p16.drawText('Terima kasih atas doa tulus, kehadiran, dan silaturahmi', {
    x: 135,
    y: 390,
    size: 12,
    font: fontTimes,
    color: rgb(0.9, 0.9, 0.88),
  });
  p16.drawText('Bapak / Ibu / Saudara sekalian.', {
    x: 205,
    y: 370,
    size: 12,
    font: fontTimes,
    color: rgb(0.9, 0.9, 0.88),
  });

  p16.drawText('Semoga amal jariyah dan kebaikan senantiasa terlimpah', {
    x: 135,
    y: 330,
    size: 11,
    font: fontTimesItalic,
    color: rgb(0.75, 0.78, 0.76),
  });
  p16.drawText('kepada almarhum / almarhumah dan keluarga yang ditinggalkan.', {
    x: 120,
    y: 312,
    size: 11,
    font: fontTimesItalic,
    color: rgb(0.75, 0.78, 0.76),
  });

  p16.drawText('Buku Yasin Digital • Publikasi Web Publik', {
    x: 185,
    y: 80,
    size: 10,
    font: fontHelvetica,
    color: rgb(0.65, 0.7, 0.67),
  });

  // Simpan PDF
  const pdfBytes = await pdfDoc.save();
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const outputPath = path.join(publicDir, 'yasin-default.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Default Yasin PDF generated successfully: ${outputPath} (${pdfBytes.length} bytes, 16 pages)`);
}

generateDefaultPdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
