// Daftar PTN & PTS Indonesia + jurusan populer + estimasi passing grade SNBT 2026
// Data estimasi berdasarkan data tahun sebelumnya — 50+ universitas seluruh Indonesia

const UNIVERSITAS_DATA = [
  // ==================== JAWA ====================
  // --- DKI Jakarta & Banten ---
  { id: 'ui', nama: 'Universitas Indonesia', singkatan: 'UI', lokasi: 'Depok, Jawa Barat', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 730 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 710 },
    { nama: 'Ilmu Komputer', rumpun: 'Saintek', passing_grade: 700 },
    { nama: 'Teknik Elektro', rumpun: 'Saintek', passing_grade: 680 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 670 },
    { nama: 'Sistem Informasi', rumpun: 'Saintek', passing_grade: 680 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 700 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 690 },
    { nama: 'Akuntansi', rumpun: 'Soshum', passing_grade: 680 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 680 },
    { nama: 'Ilmu Komunikasi', rumpun: 'Soshum', passing_grade: 670 },
    { nama: 'Hubungan Internasional', rumpun: 'Soshum', passing_grade: 660 },
  ]},
  { id: 'unj', nama: 'Universitas Negeri Jakarta', singkatan: 'UNJ', lokasi: 'Jakarta', jurusan: [
    { nama: 'Pendidikan Bahasa Inggris', rumpun: 'Soshum', passing_grade: 600 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 590 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 590 },
    { nama: 'Pendidikan Matematika', rumpun: 'Saintek', passing_grade: 580 },
    { nama: 'Ilmu Komputer', rumpun: 'Saintek', passing_grade: 590 },
    { nama: 'Pendidikan Guru SD', rumpun: 'Soshum', passing_grade: 560 },
  ]},
  { id: 'upnvj', nama: 'UPN Veteran Jakarta', singkatan: 'UPNVJ', lokasi: 'Jakarta Selatan', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 650 },
    { nama: 'Informatika', rumpun: 'Saintek', passing_grade: 600 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 590 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 580 },
    { nama: 'Hubungan Internasional', rumpun: 'Soshum', passing_grade: 580 },
  ]},
  { id: 'untirta', nama: 'Universitas Sultan Ageng Tirtayasa', singkatan: 'Untirta', lokasi: 'Serang, Banten', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 620 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 560 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 550 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 540 },
  ]},
  { id: 'uinjkt', nama: 'UIN Syarif Hidayatullah', singkatan: 'UIN Jakarta', lokasi: 'Ciputat, Banten', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 630 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 580 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 570 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 560 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 570 },
  ]},
  // --- Jawa Barat ---
  { id: 'itb', nama: 'Institut Teknologi Bandung', singkatan: 'ITB', lokasi: 'Bandung, Jawa Barat', jurusan: [
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 720 },
    { nama: 'Teknik Elektro', rumpun: 'Saintek', passing_grade: 700 },
    { nama: 'Teknik Mesin', rumpun: 'Saintek', passing_grade: 680 },
    { nama: 'Teknik Kimia', rumpun: 'Saintek', passing_grade: 670 },
    { nama: 'Arsitektur', rumpun: 'Saintek', passing_grade: 660 },
    { nama: 'Sistem Informasi', rumpun: 'Saintek', passing_grade: 650 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 680 },
    { nama: 'DKV', rumpun: 'Saintek', passing_grade: 650 },
  ]},
  { id: 'unpad', nama: 'Universitas Padjadjaran', singkatan: 'Unpad', lokasi: 'Bandung, Jawa Barat', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 700 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 650 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 660 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 660 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 650 },
    { nama: 'Ilmu Komunikasi', rumpun: 'Soshum', passing_grade: 650 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 640 },
  ]},
  { id: 'ipb', nama: 'Institut Pertanian Bogor', singkatan: 'IPB', lokasi: 'Bogor, Jawa Barat', jurusan: [
    { nama: 'Ilmu Komputer', rumpun: 'Saintek', passing_grade: 660 },
    { nama: 'Statistika', rumpun: 'Saintek', passing_grade: 640 },
    { nama: 'Teknologi Pangan', rumpun: 'Saintek', passing_grade: 630 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 630 },
    { nama: 'Kedokteran Hewan', rumpun: 'Saintek', passing_grade: 620 },
    { nama: 'Gizi', rumpun: 'Saintek', passing_grade: 610 },
  ]},
  { id: 'upi', nama: 'Universitas Pendidikan Indonesia', singkatan: 'UPI', lokasi: 'Bandung, Jawa Barat', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 630 },
    { nama: 'Ilmu Komputer', rumpun: 'Saintek', passing_grade: 610 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 600 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 600 },
    { nama: 'Pendidikan Bahasa Inggris', rumpun: 'Soshum', passing_grade: 590 },
  ]},
  { id: 'unsil', nama: 'Universitas Siliwangi', singkatan: 'Unsil', lokasi: 'Tasikmalaya, Jawa Barat', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 600 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 550 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 530 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 520 },
  ]},
  // --- Jawa Tengah & DIY ---
  { id: 'ugm', nama: 'Universitas Gadjah Mada', singkatan: 'UGM', lokasi: 'Yogyakarta', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 720 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 690 },
    { nama: 'Ilmu Komputer', rumpun: 'Saintek', passing_grade: 680 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 670 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 680 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 670 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 670 },
    { nama: 'Akuntansi', rumpun: 'Soshum', passing_grade: 660 },
    { nama: 'Hubungan Internasional', rumpun: 'Soshum', passing_grade: 650 },
  ]},
  { id: 'undip', nama: 'Universitas Diponegoro', singkatan: 'Undip', lokasi: 'Semarang, Jawa Tengah', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 680 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 650 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 640 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 630 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 630 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 630 },
  ]},
  { id: 'uns', nama: 'Universitas Sebelas Maret', singkatan: 'UNS', lokasi: 'Surakarta, Jawa Tengah', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 660 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 620 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 620 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 610 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 610 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 610 },
  ]},
  { id: 'uny', nama: 'Universitas Negeri Yogyakarta', singkatan: 'UNY', lokasi: 'Yogyakarta', jurusan: [
    { nama: 'Pendidikan Bahasa Inggris', rumpun: 'Soshum', passing_grade: 580 },
    { nama: 'Ilmu Komputer', rumpun: 'Saintek', passing_grade: 580 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 580 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 570 },
  ]},
  { id: 'unnes', nama: 'Universitas Negeri Semarang', singkatan: 'Unnes', lokasi: 'Semarang, Jawa Tengah', jurusan: [
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 570 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 570 },
    { nama: 'Ilmu Komputer', rumpun: 'Saintek', passing_grade: 570 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 560 },
  ]},
  { id: 'upnvy', nama: 'UPN Veteran Yogyakarta', singkatan: 'UPNVY', lokasi: 'Yogyakarta', jurusan: [
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 580 },
    { nama: 'Teknik Industri', rumpun: 'Saintek', passing_grade: 560 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 560 },
    { nama: 'Hubungan Internasional', rumpun: 'Soshum', passing_grade: 560 },
  ]},
  { id: 'unsoed', nama: 'Universitas Jenderal Soedirman', singkatan: 'Unsoed', lokasi: 'Purwokerto, Jawa Tengah', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 640 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 580 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 570 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 560 },
  ]},
  // --- Jawa Timur ---
  { id: 'unair', nama: 'Universitas Airlangga', singkatan: 'Unair', lokasi: 'Surabaya, Jawa Timur', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 700 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 650 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 650 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 640 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 640 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 640 },
  ]},
  { id: 'its', nama: 'Institut Teknologi Sepuluh Nopember', singkatan: 'ITS', lokasi: 'Surabaya, Jawa Timur', jurusan: [
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 670 },
    { nama: 'Teknik Elektro', rumpun: 'Saintek', passing_grade: 650 },
    { nama: 'Sistem Informasi', rumpun: 'Saintek', passing_grade: 650 },
    { nama: 'Teknik Mesin', rumpun: 'Saintek', passing_grade: 640 },
    { nama: 'Arsitektur', rumpun: 'Saintek', passing_grade: 620 },
  ]},
  { id: 'ub', nama: 'Universitas Brawijaya', singkatan: 'UB', lokasi: 'Malang, Jawa Timur', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 670 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 640 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 630 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 630 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 620 },
  ]},
  { id: 'unesa', nama: 'Universitas Negeri Surabaya', singkatan: 'Unesa', lokasi: 'Surabaya, Jawa Timur', jurusan: [
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 580 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 570 },
    { nama: 'Informatika', rumpun: 'Saintek', passing_grade: 570 },
    { nama: 'Pendidikan Bahasa Inggris', rumpun: 'Soshum', passing_grade: 560 },
  ]},
  { id: 'um', nama: 'Universitas Negeri Malang', singkatan: 'UM', lokasi: 'Malang, Jawa Timur', jurusan: [
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 580 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 570 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 570 },
    { nama: 'Pendidikan Bahasa Inggris', rumpun: 'Soshum', passing_grade: 560 },
  ]},
  { id: 'unej', nama: 'Universitas Jember', singkatan: 'Unej', lokasi: 'Jember, Jawa Timur', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 630 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 570 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 560 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 560 },
  ]},
  { id: 'utm', nama: 'Universitas Trunojoyo Madura', singkatan: 'UTM', lokasi: 'Bangkalan, Jawa Timur', jurusan: [
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 530 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 520 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 520 },
  ]},

  // ==================== SUMATERA ====================
  { id: 'usk', nama: 'Universitas Syiah Kuala', singkatan: 'USK', lokasi: 'Banda Aceh, Aceh', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 640 },
    { nama: 'Kedokteran Gigi', rumpun: 'Saintek', passing_grade: 620 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 570 },
    { nama: 'Teknik Sipil', rumpun: 'Saintek', passing_grade: 570 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 550 },
  ]},
  { id: 'usu', nama: 'Universitas Sumatera Utara', singkatan: 'USU', lokasi: 'Medan, Sumatera Utara', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 660 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 620 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 610 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 620 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 600 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 600 },
  ]},
  { id: 'unimed', nama: 'Universitas Negeri Medan', singkatan: 'Unimed', lokasi: 'Medan, Sumatera Utara', jurusan: [
    { nama: 'Pendidikan Bahasa Inggris', rumpun: 'Soshum', passing_grade: 550 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 540 },
    { nama: 'Informatika', rumpun: 'Saintek', passing_grade: 540 },
  ]},
  { id: 'unand', nama: 'Universitas Andalas', singkatan: 'Unand', lokasi: 'Padang, Sumatera Barat', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 650 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 590 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 590 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 590 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 570 },
  ]},
  { id: 'unp', nama: 'Universitas Negeri Padang', singkatan: 'UNP', lokasi: 'Padang, Sumatera Barat', jurusan: [
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 550 },
    { nama: 'Pendidikan Bahasa Inggris', rumpun: 'Soshum', passing_grade: 540 },
    { nama: 'Informatika', rumpun: 'Saintek', passing_grade: 540 },
  ]},
  { id: 'unri', nama: 'Universitas Riau', singkatan: 'Unri', lokasi: 'Pekanbaru, Riau', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 630 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 560 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 560 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 550 },
  ]},
  { id: 'unsri', nama: 'Universitas Sriwijaya', singkatan: 'Unsri', lokasi: 'Palembang, Sumatera Selatan', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 640 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 580 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 580 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 560 },
  ]},
  { id: 'unila', nama: 'Universitas Lampung', singkatan: 'Unila', lokasi: 'Bandar Lampung, Lampung', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 630 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 580 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 580 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 570 },
  ]},
  { id: 'unib', nama: 'Universitas Bengkulu', singkatan: 'Unib', lokasi: 'Bengkulu', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 610 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 530 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 520 },
  ]},

  // ==================== KALIMANTAN ====================
  { id: 'untan', nama: 'Universitas Tanjungpura', singkatan: 'Untan', lokasi: 'Pontianak, Kalimantan Barat', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 620 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 540 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 540 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 530 },
  ]},
  { id: 'ulm', nama: 'Universitas Lambung Mangkurat', singkatan: 'ULM', lokasi: 'Banjarmasin, Kalimantan Selatan', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 620 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 540 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 530 },
  ]},
  { id: 'unmul', nama: 'Universitas Mulawarman', singkatan: 'Unmul', lokasi: 'Samarinda, Kalimantan Timur', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 620 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 550 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 540 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 540 },
  ]},
  { id: 'upr', nama: 'Universitas Palangka Raya', singkatan: 'UPR', lokasi: 'Palangka Raya, Kalimantan Tengah', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 600 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 510 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 500 },
  ]},
  { id: 'ubt', nama: 'Universitas Borneo Tarakan', singkatan: 'UBT', lokasi: 'Tarakan, Kalimantan Utara', jurusan: [
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 490 },
    { nama: 'Informatika', rumpun: 'Saintek', passing_grade: 490 },
  ]},

  // ==================== SULAWESI ====================
  { id: 'unhas', nama: 'Universitas Hasanuddin', singkatan: 'Unhas', lokasi: 'Makassar, Sulawesi Selatan', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 660 },
    { nama: 'Kedokteran Gigi', rumpun: 'Saintek', passing_grade: 630 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 620 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 610 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 600 },
    { nama: 'Farmasi', rumpun: 'Saintek', passing_grade: 600 },
  ]},
  { id: 'unm', nama: 'Universitas Negeri Makassar', singkatan: 'UNM', lokasi: 'Makassar, Sulawesi Selatan', jurusan: [
    { nama: 'Pendidikan Bahasa Inggris', rumpun: 'Soshum', passing_grade: 540 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 540 },
    { nama: 'Informatika', rumpun: 'Saintek', passing_grade: 530 },
  ]},
  { id: 'unsrat', nama: 'Universitas Sam Ratulangi', singkatan: 'Unsrat', lokasi: 'Manado, Sulawesi Utara', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 630 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 550 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 540 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 540 },
  ]},
  { id: 'unima', nama: 'Universitas Negeri Manado', singkatan: 'Unima', lokasi: 'Manado, Sulawesi Utara', jurusan: [
    { nama: 'Pendidikan Bahasa Inggris', rumpun: 'Soshum', passing_grade: 510 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 500 },
  ]},
  { id: 'untad', nama: 'Universitas Tadulako', singkatan: 'Untad', lokasi: 'Palu, Sulawesi Tengah', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 610 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 520 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 510 },
  ]},
  { id: 'uho', nama: 'Universitas Halu Oleo', singkatan: 'UHO', lokasi: 'Kendari, Sulawesi Tenggara', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 600 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 520 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 510 },
  ]},
  { id: 'ung', nama: 'Universitas Negeri Gorontalo', singkatan: 'UNG', lokasi: 'Gorontalo', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 590 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 500 },
    { nama: 'Informatika', rumpun: 'Saintek', passing_grade: 500 },
  ]},

  // ==================== BALI & NUSA TENGGARA ====================
  { id: 'unud', nama: 'Universitas Udayana', singkatan: 'Unud', lokasi: 'Denpasar, Bali', jurusan: [
    { nama: 'Pendidikan Dokter', rumpun: 'Saintek', passing_grade: 650 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 590 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 580 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 580 },
    { nama: 'Pariwisata', rumpun: 'Soshum', passing_grade: 560 },
  ]},
  { id: 'undiksha', nama: 'Universitas Pendidikan Ganesha', singkatan: 'Undiksha', lokasi: 'Singaraja, Bali', jurusan: [
    { nama: 'Informatika', rumpun: 'Saintek', passing_grade: 540 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 530 },
    { nama: 'Pendidikan Bahasa Inggris', rumpun: 'Soshum', passing_grade: 520 },
  ]},
  { id: 'unram', nama: 'Universitas Mataram', singkatan: 'Unram', lokasi: 'Mataram, NTB', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 620 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 530 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 520 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 520 },
  ]},
  { id: 'undana', nama: 'Universitas Nusa Cendana', singkatan: 'Undana', lokasi: 'Kupang, NTT', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 600 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 510 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 500 },
  ]},

  // ==================== MALUKU & PAPUA ====================
  { id: 'unpatti', nama: 'Universitas Pattimura', singkatan: 'Unpatti', lokasi: 'Ambon, Maluku', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 590 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 500 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 490 },
  ]},
  { id: 'unkhair', nama: 'Universitas Khairun', singkatan: 'Unkhair', lokasi: 'Ternate, Maluku Utara', jurusan: [
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 490 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 480 },
  ]},
  { id: 'uncen', nama: 'Universitas Cenderawasih', singkatan: 'Uncen', lokasi: 'Jayapura, Papua', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 580 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 490 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 480 },
  ]},
  { id: 'unmus', nama: 'Universitas Musamus', singkatan: 'Unmus', lokasi: 'Merauke, Papua Selatan', jurusan: [
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 480 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 470 },
  ]},

  // ==================== PTS FAVORIT ====================
  { id: 'binus', nama: 'Bina Nusantara University', singkatan: 'BINUS', lokasi: 'Jakarta', jurusan: [
    { nama: 'Computer Science', rumpun: 'Saintek', passing_grade: 650 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 640 },
    { nama: 'Sistem Informasi', rumpun: 'Saintek', passing_grade: 620 },
    { nama: 'DKV', rumpun: 'Saintek', passing_grade: 600 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 580 },
  ]},
  { id: 'telu', nama: 'Telkom University', singkatan: 'Tel-U', lokasi: 'Bandung, Jawa Barat', jurusan: [
    { nama: 'Informatika', rumpun: 'Saintek', passing_grade: 630 },
    { nama: 'Teknik Telekomunikasi', rumpun: 'Saintek', passing_grade: 600 },
    { nama: 'Sistem Informasi', rumpun: 'Saintek', passing_grade: 590 },
    { nama: 'DKV', rumpun: 'Saintek', passing_grade: 580 },
  ]},
  { id: 'uii', nama: 'Universitas Islam Indonesia', singkatan: 'UII', lokasi: 'Yogyakarta', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 620 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 580 },
    { nama: 'Informatika', rumpun: 'Saintek', passing_grade: 580 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 560 },
  ]},
  { id: 'umy', nama: 'Universitas Muhammadiyah Yogyakarta', singkatan: 'UMY', lokasi: 'Yogyakarta', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 610 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 540 },
    { nama: 'Hubungan Internasional', rumpun: 'Soshum', passing_grade: 540 },
  ]},
  { id: 'trisakti', nama: 'Universitas Trisakti', singkatan: 'Trisakti', lokasi: 'Jakarta', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 630 },
    { nama: 'Arsitektur', rumpun: 'Saintek', passing_grade: 580 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 560 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 560 },
  ]},
  { id: 'untar', nama: 'Universitas Tarumanagara', singkatan: 'Untar', lokasi: 'Jakarta', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 620 },
    { nama: 'Psikologi', rumpun: 'Soshum', passing_grade: 570 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 550 },
  ]},
  { id: 'uph', nama: 'Universitas Pelita Harapan', singkatan: 'UPH', lokasi: 'Tangerang, Banten', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 640 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 570 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 550 },
  ]},
  { id: 'umm', nama: 'Universitas Muhammadiyah Malang', singkatan: 'UMM', lokasi: 'Malang, Jawa Timur', jurusan: [
    { nama: 'Kedokteran', rumpun: 'Saintek', passing_grade: 600 },
    { nama: 'Teknik Informatika', rumpun: 'Saintek', passing_grade: 550 },
    { nama: 'Manajemen', rumpun: 'Soshum', passing_grade: 530 },
    { nama: 'Hukum', rumpun: 'Soshum', passing_grade: 530 },
  ]},
];

export default UNIVERSITAS_DATA;
