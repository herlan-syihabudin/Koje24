(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,33525,(a,e,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"warnOnce",{enumerable:!0,get:function(){return t}});let t=a=>{}},98183,(a,e,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0});var t={assign:function(){return l},searchParamsToUrlQuery:function(){return i},urlQueryToSearchParams:function(){return s}};for(var r in t)Object.defineProperty(n,r,{enumerable:!0,get:t[r]});function i(a){let e={};for(let[n,t]of a.entries()){let a=e[n];void 0===a?e[n]=t:Array.isArray(a)?a.push(t):e[n]=[a,t]}return e}function u(a){return"string"==typeof a?a:("number"!=typeof a||isNaN(a))&&"boolean"!=typeof a?"":String(a)}function s(a){let e=new URLSearchParams;for(let[n,t]of Object.entries(a))if(Array.isArray(t))for(let a of t)e.append(n,u(a));else e.set(n,u(t));return e}function l(a,...e){for(let n of e){for(let e of n.keys())a.delete(e);for(let[e,t]of n.entries())a.append(e,t)}return a}},95057,(a,e,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0});var t={formatUrl:function(){return s},formatWithValidation:function(){return o},urlObjectKeys:function(){return l}};for(var r in t)Object.defineProperty(n,r,{enumerable:!0,get:t[r]});let i=a.r(90809)._(a.r(98183)),u=/https?|ftp|gopher|file/;function s(a){let{auth:e,hostname:n}=a,t=a.protocol||"",r=a.pathname||"",s=a.hash||"",l=a.query||"",o=!1;e=e?encodeURIComponent(e).replace(/%3A/i,":")+"@":"",a.host?o=e+a.host:n&&(o=e+(~n.indexOf(":")?`[${n}]`:n),a.port&&(o+=":"+a.port)),l&&"object"==typeof l&&(l=String(i.urlQueryToSearchParams(l)));let m=a.search||l&&`?${l}`||"";return t&&!t.endsWith(":")&&(t+=":"),a.slashes||(!t||u.test(t))&&!1!==o?(o="//"+(o||""),r&&"/"!==r[0]&&(r="/"+r)):o||(o=""),s&&"#"!==s[0]&&(s="#"+s),m&&"?"!==m[0]&&(m="?"+m),r=r.replace(/[?#]/g,encodeURIComponent),m=m.replace("#","%23"),`${t}${o}${r}${m}${s}`}let l=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function o(a){return s(a)}},18581,(a,e,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"useMergedRef",{enumerable:!0,get:function(){return r}});let t=a.r(71645);function r(a,e){let n=(0,t.useRef)(null),r=(0,t.useRef)(null);return(0,t.useCallback)(t=>{if(null===t){let a=n.current;a&&(n.current=null,a());let e=r.current;e&&(r.current=null,e())}else a&&(n.current=i(a,t)),e&&(r.current=i(e,t))},[a,e])}function i(a,e){if("function"!=typeof a)return a.current=e,()=>{a.current=null};{let n=a(e);return"function"==typeof n?n:()=>a(null)}}("function"==typeof n.default||"object"==typeof n.default&&null!==n.default)&&void 0===n.default.__esModule&&(Object.defineProperty(n.default,"__esModule",{value:!0}),Object.assign(n.default,n),e.exports=n.default)},18967,(a,e,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0});var t={DecodeError:function(){return h},MiddlewareNotFoundError:function(){return K},MissingStaticPage:function(){return P},NormalizeError:function(){return b},PageNotFoundError:function(){return y},SP:function(){return g},ST:function(){return f},WEB_VITALS:function(){return i},execOnce:function(){return u},getDisplayName:function(){return d},getLocationOrigin:function(){return o},getURL:function(){return m},isAbsoluteUrl:function(){return l},isResSent:function(){return p},loadGetInitialProps:function(){return k},normalizeRepeatedSlashes:function(){return c},stringifyError:function(){return j}};for(var r in t)Object.defineProperty(n,r,{enumerable:!0,get:t[r]});let i=["CLS","FCP","FID","INP","LCP","TTFB"];function u(a){let e,n=!1;return(...t)=>(n||(n=!0,e=a(...t)),e)}let s=/^[a-zA-Z][a-zA-Z\d+\-.]*?:/,l=a=>s.test(a);function o(){let{protocol:a,hostname:e,port:n}=window.location;return`${a}//${e}${n?":"+n:""}`}function m(){let{href:a}=window.location,e=o();return a.substring(e.length)}function d(a){return"string"==typeof a?a:a.displayName||a.name||"Unknown"}function p(a){return a.finished||a.headersSent}function c(a){let e=a.split("?");return e[0].replace(/\\/g,"/").replace(/\/\/+/g,"/")+(e[1]?`?${e.slice(1).join("?")}`:"")}async function k(a,e){let n=e.res||e.ctx&&e.ctx.res;if(!a.getInitialProps)return e.ctx&&e.Component?{pageProps:await k(e.Component,e.ctx)}:{};let t=await a.getInitialProps(e);if(n&&p(n))return t;if(!t)throw Object.defineProperty(Error(`"${d(a)}.getInitialProps()" should resolve to an object. But found "${t}" instead.`),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0});return t}let g="undefined"!=typeof performance,f=g&&["mark","measure","getEntriesByName"].every(a=>"function"==typeof performance[a]);class h extends Error{}class b extends Error{}class y extends Error{constructor(a){super(),this.code="ENOENT",this.name="PageNotFoundError",this.message=`Cannot find module for page: ${a}`}}class P extends Error{constructor(a,e){super(),this.message=`Failed to load static file for page: ${a} ${e}`}}class K extends Error{constructor(){super(),this.code="ENOENT",this.message="Cannot find the middleware module"}}function j(a){return JSON.stringify({message:a.message,stack:a.stack})}},73668,(a,e,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"isLocalURL",{enumerable:!0,get:function(){return i}});let t=a.r(18967),r=a.r(52817);function i(a){if(!(0,t.isAbsoluteUrl)(a))return!0;try{let e=(0,t.getLocationOrigin)(),n=new URL(a,e);return n.origin===e&&(0,r.hasBasePath)(n.pathname)}catch(a){return!1}}},84508,(a,e,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"errorOnce",{enumerable:!0,get:function(){return t}});let t=a=>{}},22016,(a,e,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0});var t={default:function(){return h},useLinkStatus:function(){return y}};for(var r in t)Object.defineProperty(n,r,{enumerable:!0,get:t[r]});let i=a.r(90809),u=a.r(43476),s=i._(a.r(71645)),l=a.r(95057),o=a.r(8372),m=a.r(18581),d=a.r(18967),p=a.r(5550);a.r(33525);let c=a.r(91949),k=a.r(73668),g=a.r(65165);function f(a){return"string"==typeof a?a:(0,l.formatUrl)(a)}function h(e){var n;let t,r,i,[l,h]=(0,s.useOptimistic)(c.IDLE_LINK_STATUS),y=(0,s.useRef)(null),{href:P,as:K,children:j,prefetch:O=null,passHref:E,replace:v,shallow:C,scroll:J,onClick:x,onMouseEnter:A,onTouchStart:S,legacyBehavior:T=!1,onNavigate:M,ref:w,unstable_dynamicOnHover:R,...B}=e;t=j,T&&("string"==typeof t||"number"==typeof t)&&(t=(0,u.jsx)("a",{children:t}));let _=s.default.useContext(o.AppRouterContext),L=!1!==O,N=!1!==O?null===(n=O)||"auto"===n?g.FetchStrategy.PPR:g.FetchStrategy.Full:g.FetchStrategy.PPR,{href:D,as:F}=s.default.useMemo(()=>{let a=f(P);return{href:a,as:K?f(K):a}},[P,K]);if(T){if(t?.$$typeof===Symbol.for("react.lazy"))throw Object.defineProperty(Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."),"__NEXT_ERROR_CODE",{value:"E863",enumerable:!1,configurable:!0});r=s.default.Children.only(t)}let U=T?r&&"object"==typeof r&&r.ref:w,I=s.default.useCallback(a=>(null!==_&&(y.current=(0,c.mountLinkInstance)(a,D,_,N,L,h)),()=>{y.current&&((0,c.unmountLinkForCurrentNavigation)(y.current),y.current=null),(0,c.unmountPrefetchableInstance)(a)}),[L,D,_,N,h]),$={ref:(0,m.useMergedRef)(I,U),onClick(e){T||"function"!=typeof x||x(e),T&&r.props&&"function"==typeof r.props.onClick&&r.props.onClick(e),!_||e.defaultPrevented||function(e,n,t,r,i,u,l){if("undefined"!=typeof window){let o,{nodeName:m}=e.currentTarget;if("A"===m.toUpperCase()&&((o=e.currentTarget.getAttribute("target"))&&"_self"!==o||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.nativeEvent&&2===e.nativeEvent.which)||e.currentTarget.hasAttribute("download"))return;if(!(0,k.isLocalURL)(n)){i&&(e.preventDefault(),location.replace(n));return}if(e.preventDefault(),l){let a=!1;if(l({preventDefault:()=>{a=!0}}),a)return}let{dispatchNavigateAction:d}=a.r(99781);s.default.startTransition(()=>{d(t||n,i?"replace":"push",u??!0,r.current)})}}(e,D,F,y,v,J,M)},onMouseEnter(a){T||"function"!=typeof A||A(a),T&&r.props&&"function"==typeof r.props.onMouseEnter&&r.props.onMouseEnter(a),_&&L&&(0,c.onNavigationIntent)(a.currentTarget,!0===R)},onTouchStart:function(a){T||"function"!=typeof S||S(a),T&&r.props&&"function"==typeof r.props.onTouchStart&&r.props.onTouchStart(a),_&&L&&(0,c.onNavigationIntent)(a.currentTarget,!0===R)}};return(0,d.isAbsoluteUrl)(F)?$.href=F:T&&!E&&("a"!==r.type||"href"in r.props)||($.href=(0,p.addBasePath)(F)),i=T?s.default.cloneElement(r,$):(0,u.jsx)("a",{...B,...$,children:t}),(0,u.jsx)(b.Provider,{value:l,children:i})}a.r(84508);let b=(0,s.createContext)(c.IDLE_LINK_STATUS),y=()=>(0,s.useContext)(b);("function"==typeof n.default||"object"==typeof n.default&&null!==n.default)&&void 0===n.default.__esModule&&(Object.defineProperty(n.default,"__esModule",{value:!0}),Object.assign(n.default,n),e.exports=n.default)},71689,39811,a=>{"use strict";let e=(0,a.i(75254).default)("arrow-left",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);a.s(["ArrowLeft",()=>e],71689);let n={akun:{title:"Akun & Keamanan",items:[{slug:"lupa-password",title:"Lupa Password",summary:"Cara reset password akun KOJE24 jika lupa.",content:`
## Cara Mengatasi Lupa Password

1. Buka halaman login KOJE24.
2. Klik **Lupa Password**.
3. Masukkan email yang terdaftar di KOJE24.
4. Cek email masuk → klik link reset password.
5. Buat password baru dan login kembali.

**Catatan:** Jika email tidak masuk, cek folder spam atau gunakan fitur *kirim ulang*.`},{slug:"ubah-data-akun",title:"Mengubah Data Akun",summary:"Panduan mengganti nama, email, atau nomor WhatsApp.",content:`
## Cara Mengubah Data Akun

1. Login ke akun KOJE24.
2. Buka menu **Profil Saya**.
3. Pilih data yang ingin diubah — nama, email, atau nomor WhatsApp.
4. Klik **Simpan Perubahan**.

Data akan tersimpan secara otomatis di sistem KOJE24.`},{slug:"keamanan-akun",title:"Tips Keamanan Akun",summary:"Cara menjaga akun tetap aman dari penyalahgunaan.",content:`
## Tips Keamanan Akun KOJE24

- Gunakan password yang kuat dan tidak mudah ditebak.
- Jangan bagikan OTP atau link login kepada siapapun.
- Logout setelah menggunakan device umum.
- Jika merasa akun disusupi, segera ganti password.`},{slug:"hapus-akun",title:"Menghapus Akun KOJE24",summary:"Cara menghapus atau menonaktifkan akun.",content:`
## Cara Menghapus Akun KOJE24

Jika ingin menghapus akun:

1. Hubungi Admin KOJE24 melalui chat.
2. Berikan email yang digunakan di KOJE24.
3. Admin akan memproses permintaan penghapusan.

**Catatan:** Data yang telah dihapus tidak bisa dikembalikan.`},{slug:"verifikasi-email",title:"Verifikasi Email",summary:"Cara verifikasi email agar pesanan aman.",content:`
## Cara Verifikasi Email KOJE24

1. Buka kotak masuk email.
2. Cari pesan dari KOJE24.
3. Klik tombol **Verifikasi Email**.

Jika tidak ada email, gunakan fitur **Kirim Ulang Verifikasi** di halaman profil.`}]},pesanan:{title:"Pesanan",items:[{slug:"cek-status-pesanan",title:"Cara Cek Status Pesanan",summary:"Lihat status pesanan mulai dari diproses hingga selesai.",content:`
## Cara Cek Status Pesanan

1. Masuk ke halaman **Pesanan Saya**.
2. Pilih pesanan yang ingin dilihat.
3. Status pesanan akan muncul, mulai dari:
   - Menunggu Diproses
   - Produksi
   - Pickup Kurir
   - Dalam Perjalanan
   - Selesai`},{slug:"ubah-pesanan",title:"Mengubah Pesanan",summary:"Apakah pesanan bisa diubah setelah checkout?",content:`
## Mengubah Pesanan KOJE24

- Pesanan **bisa diubah** selama belum masuk proses produksi.
- Hubungi Admin KOJE24 secepatnya setelah checkout.

Setelah jus diproduksi, pesanan **tidak bisa diubah**.`},{slug:"batal-pesanan",title:"Membatalkan Pesanan",summary:"Pembatalan pesanan dan kebijakan refund.",content:`
## Cara Membatalkan Pesanan

1. Buka menu **Pesanan Saya**.
2. Klik **Batalkan Pesanan** (jika masih ada).
3. Jika tombol tidak tersedia → pesanan sudah diproduksi.

Refund mengikuti kebijakan pengembalian dana KOJE24.`},{slug:"pesanan-tidak-masuk",title:"Pesanan Tidak Masuk",summary:"Sudah bayar tapi pesanan tidak muncul?",content:`
## Cara Mengatasi Pesanan Tidak Masuk

1. Pastikan pembayaran berhasil.
2. Tunggu 1–3 menit sinkronisasi.
3. Jika tetap tidak muncul:
   - Kirim bukti pembayaran ke Admin KOJE24.
   - Sertakan nomor WhatsApp dan email.`},{slug:"pesanan-ganda",title:"Pesanan Terkirim Dua Kali",summary:"Cara menangani pesanan double.",content:`
## Pesanan Ganda (Double Order)

Jika pesanan muncul dua kali:

- Jangan panik.
- Screenshot dua-duanya.
- Kirim ke Admin KOJE24.

Admin akan bantu membatalkan salah satu pesanan.`}]},pembayaran:{title:"Pembayaran",items:[{slug:"metode-pembayaran",title:"Metode Pembayaran",summary:"Daftar metode pembayaran yang tersedia.",content:`
## Metode Pembayaran KOJE24

- Transfer Bank (BCA, Mandiri)
- QRIS
- E-Wallet (OVO, Dana, GoPay)

Pastikan nama pengirim sesuai agar verifikasi cepat.`},{slug:"pembayaran-gagal",title:"Pembayaran Gagal",summary:"Cara penyelesaian jika pembayaran gagal.",content:`
## Pembayaran Gagal

Jika pembayaran ditolak:

1. Cek saldo / limit e-wallet.
2. Coba ulang dalam 1 menit.
3. Jika sudah terdebet → kirim bukti transfer ke Admin.

Admin akan verifikasi maksimal 10 menit.`},{slug:"tagihan-tidak-muncul",title:"Tagihan Tidak Muncul",summary:"Invoice tidak keluar saat checkout?",content:`
## Tagihan Tidak Muncul

1. Refresh halaman.
2. Pastikan koneksi stabil.
3. Coba checkout ulang.
4. Jika tetap gagal → kirim screenshot ke Admin.`},{slug:"double-payment",title:"Pembayaran DoBel",summary:"Ketika uang terpotong dua kali.",content:`
## Pembayaran DoBel

Jika uang terdebet 2 kali:

- Kirim dua bukti transaksi.
- Admin akan cek keuangan KOJE24.
- Refund akan diproses maksimal 1\xd724 jam.`},{slug:"konfirmasi-manual",title:"Konfirmasi Pembayaran Manual",summary:"Cara mempercepat verifikasi pembayaran.",content:`
## Konfirmasi Manual

Jika pembayaran tidak terdeteksi:

- Kirim foto bukti transfer.
- Sertakan nama pengirim & jumlah pembayaran.
- Admin akan input manual dalam 3–5 menit.`}]},pengiriman:{title:"Pengiriman",items:[{slug:"cek-resi",title:"Cara Cek Resi",summary:"Lacak perjalanan kurir.",content:`
## Cara Cek Resi

1. Buka Pesanan Saya.
2. Klik Detail Pengiriman.
3. Nomor resi dan status perjalanan akan tampil lengkap.

Biasanya update 5–15 menit setelah pickup.`},{slug:"jadwal-kirim",title:"Jadwal Pengiriman",summary:"Jam dan aturan pengiriman KOJE24.",content:`
## Jadwal Pengiriman KOJE24

- Pengiriman dilakukan setiap hari.
- Waktu pengiriman: **09.00 – 17.00**.
- Untuk pemesanan malam → dikirim besok pagi.`},{slug:"ganti-alamat",title:"Ganti Alamat Pengiriman",summary:"Cara ubah alamat setelah checkout.",content:`
## Mengganti Alamat Pengiriman

Alamat bisa diganti sebelum pesanan dipickup kurir.

Jika pesanan sudah dalam perjalanan → tidak bisa diganti.`},{slug:"pengiriman-terlambat",title:"Pengiriman Terlambat",summary:"Apa yang harus dilakukan jika pesanan lama datang?",content:`
## Pengiriman Terlambat

- Cek status resi.
- Jika lebih dari 2 jam dari estimasi → hubungi Admin KOJE24.
- Admin akan cek ke kurir dan tindak lanjut.`},{slug:"kurir-tidak-ditemukan",title:"Kurir Tidak Ditemukan",summary:"Kurir tiba-tiba hilang atau berhenti update.",content:`
## Kurir Tidak Ditemukan

- Kadang aplikasi kurir error.
- Pastikan sinyal kurir stabil.
- Jika 30 menit tanpa update → Koje24 akan hubungi kurir.`}]},refund:{title:"Pengembalian Dana",items:[{slug:"cara-refund",title:"Cara Mengajukan Refund",summary:"Langkah-langkah refund pesanan.",content:`
## Cara Mengajukan Refund

1. Screenshot pesanan.
2. Jelaskan kendala.
3. Kirim ke Admin.

Refund diproses maksimal **1\xd724 jam**.`},{slug:"syarat-refund",title:"Syarat Refund",summary:"Ketentuan pesanan yang bisa direfund.",content:`
## Syarat Refund KOJE24

- Produk rusak saat diterima.
- Kurir salah tujuan.
- Pesanan tidak diproduksi.

Tidak berlaku untuk pembatalan sepihak setelah produksi.`},{slug:"refund-belum-masuk",title:"Refund Belum Masuk",summary:"Uang refund belum diterima setelah diproses.",content:`
## Refund Belum Masuk

- Cek mutasi bank / e-wallet.
- Screenshot mutasi kosong.
- KOJE24 akan follow up bank terkait.`},{slug:"jenis-refund",title:"Jenis Pengembalian Dana",summary:"Pengembalian bisa berupa uang atau voucher.",content:`
## Jenis Refund

- **Kembali ke rekening** (utama)
- **Voucher belanja** (opsional)
`},{slug:"lama-proses",title:"Lama Proses Refund",summary:"Estimasi durasi penyelesaian refund.",content:`
## Lama Proses Refund

- Bank: 1–24 jam  
- E-wallet: 1–5 menit  
- Manual: maksimal 24 jam`}]},komplain:{title:"Komplain Pesanan",items:[{slug:"pesanan-rusak",title:"Pesanan Rusak",summary:"Botol bocor, pecah, atau tumpah.",content:`
## Pesanan Rusak

1. Foto kondisi produk.
2. Foto kemasan luar.
3. Kirim ke Admin KOJE24.

Komplain akan diganti sesuai ketentuan.`},{slug:"pesanan-kurang",title:"Pesanan Kurang",summary:"Jumlah botol tidak sesuai invoice.",content:`
## Pesanan Kurang

1. Foto seluruh produk.
2. Sertakan invoice.
3. Admin akan kirim kekurangan.`},{slug:"pesanan-salah",title:"Varian Salah",summary:"Varian yang diterima berbeda.",content:`
## Varian Salah

1. Foto varian yang diterima.
2. Foto label botol.
3. Admin akan kirim varian yang benar.`},{slug:"pesanan-tidak-sesuai",title:"Pesanan Tidak Sesuai",summary:"Detail pesanan tidak cocok.",content:`
## Pesanan Tidak Sesuai

1. Foto semua botol.
2. Sertakan invoice.
3. Admin akan perbaiki atau kirim ulang.`},{slug:"keluhan-rasa",title:"Keluhan Rasa",summary:"Rasa jus berbeda atau berubah.",content:`
## Keluhan Rasa

- Cold-pressed harus disimpan 0–4\xb0C.
- Jika rasa berubah → botol mungkin tidak dingin saat pengiriman.

Admin akan investigasi dan ganti jika valid.`}]},promo:{title:"Promosi",items:[{slug:"kode-promo",title:"Cara Menggunakan Kode Promo",summary:"Gunakan kode promo dengan benar.",content:`
## Cara Memakai Kode Promo

1. Masukkan kode promo di kolom promo.
2. Klik Terapkan.
3. Jika valid, potongan langsung muncul.`},{slug:"promo-tidak-bisa",title:"Kode Promo Tidak Bisa Dipakai",summary:"Kenapa promo ditolak?",content:`
## Kenapa Promo Tidak Bisa Dipakai?

- Masa berlaku habis.
- Minimum order belum tercapai.
- Hanya untuk varian tertentu.
- Sudah pernah digunakan sebelumnya.`},{slug:"voucher-langganan",title:"Voucher Langganan",summary:"Diskon khusus member rutin.",content:`
## Voucher Langganan

- Berlaku untuk pelanggan setia.
- Potongan otomatis setiap pembelian tertentu.`},{slug:"syarat-ketentuan",title:"Syarat & Ketentuan Promo",summary:"Detail syarat promo KOJE24.",content:`
## S&K Promo KOJE24

- Satu promo per transaksi.
- Tidak dapat dikombinasikan.
- Promo tertentu hanya untuk varian tertentu.`},{slug:"promo-bermasalah",title:"Promo Bermasalah",summary:"Promo muncul tapi tidak memotong harga.",content:`
## Promo Bermasalah

- Refresh halaman.
- Coba ulang.
- Jika tetap gagal → kirim screenshot ke Admin.`}]},lainnya:{title:"Lainnya",items:[{slug:"tentang-koje24",title:"Tentang KOJE24",summary:"Informasi brand KOJE24.",content:`
## Tentang KOJE24

KOJE24 adalah brand cold-pressed juice premium yang dibuat harian menggunakan bahan alami tanpa gula tambahan, tanpa pengawet, dan tanpa pewarna.

Kami percaya wellness harus dimulai dari pilihan kecil yang baik setiap hari.`},{slug:"jaminan-fresh",title:"Jaminan Kesegaran",summary:"Standar kesegaran produk KOJE24.",content:`
## Jaminan Kesegaran KOJE24

- Cold-pressed harian.
- Disimpan 0–4\xb0C.
- Tanpa bahan kimia.`},{slug:"penyimpanan",title:"Panduan Penyimpanan",summary:"Cara menyimpan jus agar tetap segar.",content:`
## Cara Menyimpan Jus KOJE24

- Simpan di chiller (0–4\xb0C).
- Jangan taruh di freezer.
- Kocok sebelum diminum.`},{slug:"kedaluwarsa",title:"Tanggal Kedaluwarsa",summary:"Berapa lama jus bertahan?",content:`
## Kedaluwarsa KOJE24

- Ideal dikonsumsi 2–3 hari.
- Tergantung kondisi penyimpanan.`},{slug:"pertanyaan-lain",title:"Pertanyaan Lainnya",summary:"Pertanyaan umum seputar produk.",content:`
## Pertanyaan Lainnya

Silakan chat KOJE24 untuk pertanyaan lain yang belum tercantum.`}]}};a.s(["helpCategories",0,n],39811)},24644,a=>{"use strict";var e=a.i(43476),n=a.i(18566),t=a.i(22016),r=a.i(71689);let i=(0,a.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);var u=a.i(39811);function s(){let{category:a}=(0,n.useParams)(),s=(0,n.useRouter)(),l=u.helpCategories[a];return l?(0,e.jsx)("main",{className:"min-h-screen bg-gradient-to-b from-[#f5fbfb] to-white py-12 px-4 sm:px-6",children:(0,e.jsxs)("div",{className:"max-w-4xl mx-auto",children:[(0,e.jsxs)("button",{onClick:()=>s.push("/pusat-bantuan"),className:"inline-flex items-center gap-2 text-[#0B4B50] hover:text-[#0FA3A8] mb-6",children:[(0,e.jsx)(r.ArrowLeft,{size:18}),"Kembali ke Pusat Bantuan"]}),(0,e.jsx)("h1",{className:"text-3xl sm:text-4xl font-bold text-[#0B4B50] mb-2 font-playfair",children:l.title}),(0,e.jsx)("p",{className:"text-sm text-slate-600 mb-8",children:"Pilih kendala yang ingin kamu pelajari solusinya."}),(0,e.jsx)("div",{className:"space-y-4",children:l.items.map(n=>(0,e.jsxs)(t.default,{href:`/pusat-bantuan/${a}/${n.slug}`,className:" group flex items-center justify-between p-5 rounded-2xl border border-[#d7ecec] bg-white hover:border-[#0FA3A8] hover:shadow-md transition-all duration-200 ",children:[(0,e.jsxs)("div",{children:[(0,e.jsx)("h2",{className:"text-[#0B4B50] font-semibold text-base sm:text-lg group-hover:text-[#0FA3A8]",children:n.title}),(0,e.jsx)("p",{className:"text-sm text-slate-600 mt-1",children:n.summary})]}),(0,e.jsx)(i,{size:22,className:"text-[#0FA3A8] opacity-70 group-hover:opacity-100"})]},n.slug))})]})}):(0,e.jsx)("div",{className:"min-h-screen flex items-center justify-center text-[#0B4B50] text-lg",children:"Kategori tidak ditemukan."})}a.s(["default",()=>s],24644)}]);