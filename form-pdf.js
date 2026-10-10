/* SIRBA: pembuat PDF Formulir Pengajuan Reimbursement Biaya Bensin (dipakai halaman /ajukan/ dan revisi AP).
   Butuh pdf-lib (PDFLib) dan qrcode-generator (qrcode). Kolom Persetujuan di posisi tetap: QR AP x=228, Kepala TU x=396. */
(function(){
const BULAN=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const CABANG={CNR:"Avicenna Cinere",PML:"Avicenna Pamulang",JGK:"Avicenna Jagakarsa"};
const DOK={struk:"Struk pembelian BBM",surat:"Surat tugas / undangan meeting / bukti tujuan dinas",rute:"Catatan jarak tempuh / screenshot rute (Google Maps)"};
const angka=n=>Math.round(n||0).toLocaleString("id-ID");
const fkm=n=>(+n||0).toLocaleString("id-ID",{maximumFractionDigits:1});
const tglPanjang=v=>{if(!v)return "-";const [y,m,d]=v.split("-");return `${+d} ${BULAN[m-1]} ${y}`};
const tglSlash=v=>{const [y,m,d]=v.split("-");return `${d}/${m}/${y}`};
async function buat(d){const {PDFDocument,StandardFonts,rgb}=PDFLib,r=d.r;
  const doc=await PDFDocument.create();doc.setTitle("Formulir Pengajuan Reimbursement Biaya Bensin");doc.setCreator("SIRBA Avicenna");doc.setProducer("SIRBA Avicenna");
  const pg=doc.addPage([612,936]);
  const R=await doc.embedFont(StandardFonts.TimesRoman),B=await doc.embedFont(StandardFonts.TimesRomanBold),I=await doc.embedFont(StandardFonts.TimesRomanItalic);
  const BIRU=rgb(.12,.29,.49),ABU=rgb(.94,.94,.94),GARIS=rgb(.62,.62,.62),HITAM=rgb(.08,.08,.08),MUTED=rgb(.42,.42,.42);
  const aman=s=>String(s??"").replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,"-").replace(/[^\x20-\x7E -ÿ]/g,"?");
  const T=(s,x,y,f=R,sz=9.5,c=HITAM)=>pg.drawText(aman(s),{x,y,size:sz,font:f,color:c});
  const C=(s,cx,y,f=R,sz=9.5,c=HITAM)=>{s=aman(s);T(s,cx-f.widthOfTextAtSize(s,sz)/2,y,f,sz,c)};
  const pas=(s,f,sz,w,min=7)=>{s=aman(s);while(sz>min&&f.widthOfTextAtSize(s,sz)>w)sz-=.25;if(f.widthOfTextAtSize(s,sz)>w){while(s.length>1&&f.widthOfTextAtSize(s+"...",sz)>w)s=s.slice(0,-1);s+="..."}return [s,sz]};
  const bungkus=(s,f,sz,w,maks)=>{const kata=aman(s).split(/\s+/).filter(Boolean),out=[];let l="";
    for(let k of kata){while(f.widthOfTextAtSize(k,sz)>w&&k.length>1){let i=k.length;while(i>1&&f.widthOfTextAtSize(k.slice(0,i),sz)>w)i--;if(l){out.push(l);l=""}out.push(k.slice(0,i));k=k.slice(i)}
      const t=l?l+" "+k:k;if(f.widthOfTextAtSize(t,sz)<=w)l=t;else{out.push(l);l=k}}
    if(l)out.push(l);if(!out.length)out.push("");if(maks&&out.length>maks){out.length=maks;out[maks-1]=out[maks-1].replace(/.{0,3}$/,"...")}return out};
  const kotak=(x,y,w,h,isi)=>pg.drawRectangle({x,y,width:w,height:h,borderColor:GARIS,borderWidth:.6,...(isi?{color:isi}:{})});
  const bagian=(s,y)=>{T(s,54,y,B,10,BIRU);pg.drawLine({start:{x:54,y:y-7},end:{x:558,y:y-7},thickness:.9,color:BIRU})};
  C("YAYASAN PENDIDIKAN AVICENNA PRESTASI",306,869,B,13.5);C("SEKOLAH AVICENNA",306,853,B,13.5);
  C("FORMULIR PENGAJUAN REIMBURSEMENT BIAYA BENSIN KENDARAAN PRIBADI",306,827,B,10.5,BIRU);C("Untuk Kepentingan Perjalanan Dinas",306,812,I,8.5);
  pg.drawLine({start:{x:54,y:802},end:{x:558,y:802},thickness:1.6,color:BIRU});
  /* A */
  bagian("A. DATA PEMOHON",779);
  const kend=(d.kendaraanId==="motor"?"Motor":"Mobil")+(d.unitKendaraan?" "+d.unitKendaraan:"")+" · "+r.bbmNama;
  [["Nama Karyawan",d.nama],["NIK / ID Karyawan",d.nik||"-"],["Jabatan / Unit",d.jabatan],["Jenis Kendaraan",kend.replace("·","-")],["Tanggal Pengajuan",tglPanjang(d.tglAju)]].forEach(([l,v],i)=>{
    const y0=765-(i+1)*26;kotak(54,y0,150,26,ABU);kotak(204,y0,354,26);T(l,60,y0+9,B,9.5);const [s,sz]=pas(v,R,9.5,340);T(s,210,y0+9,R,sz)});
  /* B */
  bagian("B. RINCIAN PERJALANAN DINAS",611);
  const KOL=[[54,31,"No."],[85,75,"Tanggal"],[160,100,"Asal Keberangkatan"],[260,80,"Tujuan Dinas"],[340,55,"Jarak (km)"],[395,75,"Jumlah (Rp)"],[470,88,"Keterangan"]];
  KOL.forEach(([x,w,l])=>{kotak(x,575,w,22,ABU);C(l,x+w/2,583,B,8.8)});
  const la=bungkus(d.asal,R,8.5,KOL[2][1]-8,4),lt=bungkus(d.tujuan,R,8.5,KOL[3][1]-8,4),tg=bungkus(tglPanjang(d.tanggal),R,8.5,KOL[1][1]-6,2);
  const baris=Math.max(la.length,lt.length,tg.length,1),hR=Math.max(26,baris*10+10),yR=575-hR;
  KOL.slice(0,6).forEach(([x,w])=>kotak(x,yR,w,hR));
  const tengah=(lines,i)=>{const [x,w]=KOL[i],top=yR+hR/2+(lines.length*10)/2-8;lines.forEach((s,j)=>C(s,x+w/2,top-j*10,R,8.5))};
  tengah(["1"],0);tengah(tg,1);tengah(la,2);tengah(lt,3);tengah([fkm(r.kmPP)+" PP"],4);tengah([angka(r.total)],5);
  const yT=yR-22;kotak(54,yT,341,22,ABU);C("TOTAL PENGAJUAN REIMBURSEMENT",224,yT+8,B,9);kotak(395,yT,75,22);C(angka(r.total),432.5,yT+8,B,9.5);
  kotak(470,yT,88,hR+22);const lk=bungkus(d.keperluan,R,8.5,80,Math.floor((hR+22-6)/10));lk.forEach((s,j)=>C(s,514,yT+(hR+22)/2+(lk.length*10)/2-8-j*10,R,8.5));
  let y=yT-14;
  T("Catatan: Tarif/km mengacu pada Kebijakan Reimbursement Biaya Bensin yang berlaku (bukan tarif aplikasi transportasi online).",54,y,I,7.5,MUTED);y-=10;
  const ltr=r.kmPP/r.kml;bungkus(`Perhitungan: ${fkm(r.kmPP)} km pulang pergi (sekali jalan x 2 + 5%) : ${String(r.kml).replace(".",",")} km/L = ${ltr.toLocaleString("id-ID",{maximumFractionDigits:2})} L${ltr<1?" (dibulatkan minimal 1 L)":""} x Rp ${angka(r.h)}/L (${r.bbmNama}) = Rp ${angka(r.bbm)}, dibulatkan Rp ${angka(r.total)}. Sumber jarak: ${r.sumber}.`,I,7.5,504,2).forEach(s=>{T(s,54,y,I,7.5,MUTED);y-=10});
  if(d.linkRute)bungkus("Rute acuan Google Maps: "+d.linkRute,I,7.5,504,2).forEach(s=>{T(s,54,y,I,7.5,MUTED);y-=10});
  /* C */
  y-=14;bagian("C. DOKUMEN PENDUKUNG YANG DILAMPIRKAN",y);y-=24;
  [...Object.entries(DOK),["lain","Lainnya: "+(d.dokumenLain||"______________________________________________")]].forEach(([k,l])=>{
    pg.drawRectangle({x:54,y:y-1.5,width:8.5,height:8.5,borderColor:HITAM,borderWidth:.7});
    if(d.dokumen.includes(k)){pg.drawLine({start:{x:55.5,y:y+3},end:{x:58,y:y},thickness:1.2,color:HITAM});pg.drawLine({start:{x:58,y:y},end:{x:63.5,y:y+8},thickness:1.2,color:HITAM})}
    const [s,sz]=pas(l,R,9.5,480);T(s,68,y,R,sz);y-=15});
  T("Semua dokumen di atas wajib dilampirkan dan diserahkan dalam bentuk fisik ke tim GA.",54,y,I,8,MUTED);y-=12;
  /* D */
  y-=12;bagian("D. PERNYATAAN PEMOHON",y);y-=22;
  bungkus("Saya menyatakan bahwa data dan rincian yang tercantum pada formulir ini adalah benar dan sesuai dengan perjalanan dinas yang telah dilakukan untuk kepentingan perusahaan.",R,9.5,504).forEach(s=>{T(s,54,y,R,9.5);y-=11});
  if(y<318)console.warn("SirbaFormPdf: isi bagian D menyentuh bagian E",y);
  /* E: posisi tetap, kolom AP dan Kepala TU diisi QR + nama saat approve di SIRBA */
  bagian("E. PERSETUJUAN",300);
  [["Pemohon",54],["Finance AP",222],["Kepala Tata Usaha",390]].forEach(([l,x])=>{kotak(x,262,168,24,ABU);C(l,x+84,271,B,9.5);kotak(x,176,168,86);
    T("Nama & Tanda Tangan",x+6,198,I,7,MUTED);T("Tanggal:",x+6,190,R,8)});
  {const q=qrcode(0,"M");q.addData(aman(`Pemohon: ${d.ttdPemohon.nama}${d.nik?"\nNIK: "+d.nik:""}\nCabang: ${CABANG[d.cabang]}\nTanggal tanda tangan: ${d.ttdPemohon.waktuTeks}\nKode: ${d.ttdPemohon.kode}`));q.make();
    const n=q.getModuleCount(),S=40,sel=S/n,x=60,y0=216;for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(q.isDark(i,j))pg.drawRectangle({x:x+j*sel,y:y0+(n-1-i)*sel,width:sel+.05,height:sel+.05,color:rgb(0,0,0)})}
  const [nm,nsz]=pas(d.ttdPemohon.nama,R,9,156);T(nm,60,206,R,nsz);T(tglSlash(d.tglAju),90,190,R,8);
  bungkus(`Ditandatangani secara elektronik oleh pemohon (${d.ttdPemohon.nama}) pada ${d.ttdPemohon.waktuTeks} melalui SIRBA dengan persetujuan tanda tangan elektronik (kode ${d.ttdPemohon.kode}). Tanda tangan Pemohon, Finance AP, dan Kepala Tata Usaha berupa QR di kolom masing-masing.${d.revisi?" "+d.revisi:""}`,I,7.2,504,4).forEach((s,j)=>T(s,54,160-j*9,I,7.2,MUTED));
  return await doc.save()}
window.SirbaFormPdf={buat,DOK};
})();
