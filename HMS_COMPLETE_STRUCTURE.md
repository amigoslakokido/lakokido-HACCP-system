# 📋 HMS System - Komplett Struktur med Undermeny
## نظام HMS الكامل مع القوائم الفرعية

---

## 🎯 Navigasjonsstruktur (13 Hovedmoduler + 49 Undermoduler)

### 1. 📊 Dashboard
**Oversikt + Analyse + Innsikt**
- ✅ **Oversikt** - Hovedoversikt med alle KPIer
- 🔄 **Analyser** - Detaljerte grafer og trendanalyser
- 🔄 **Innsikt** - AI-drevne anbefalinger og varsler

**Total**: 3 undermeny

---

### 2. 🎯 Målsetting
**HMS-mål og policyer**
- 🔄 **HMS-mål** - Bedriftens HMS-målsettinger
- 🔄 **Policyer** - HMS-policyer og retningslinjer
- 🔄 **Organisasjonskart** - Organisasjonsstruktur og ansvarsomåder

**Total**: 3 undermeny

---

### 3. 🏢 Bedrift
**Firmainfo + Kontakter + Forsikringer**
- ✅ **Firmaopplysninger** - Komplett firmainfo med miljøpartnere
- 🔄 **Kontakter** - Eksterne kontakter og servicepartnere
- 🔄 **Forsikringer** - Yrkesskadeforsikring og ansvarsforsikring
- 🔄 **Verneombud** - Avtale og valg av verneombud

**Total**: 4 undermeny

---

### 4. 👥 Ansatte
**Personalliste**
- 🔄 **Personalliste** - Komplett register over alle ansatte

**Total**: 1 undermeny

---

### 5. 🏥 Helse & Sikkerhet
**BHT + Førstehjelp + Risikoanalyse**
- 🔄 **BHT-avtale** - Bedriftshelsetjeneste
- 🔄 **Førstehjelp** - Utstyr og kontroll
- 🔄 **Risikoanalyse** - ROS-analyse og handlingsplaner
- 🔄 **Arbeidsmiljø** - Driftsinstrukser og rutiner

**Total**: 4 undermeny

---

### 6. 🔥 Beredskap
**Brann + Evakuering + Beredskap**
- 🔄 **Brannsikkerhet** - Branninstruks og sjekklister
- 🔄 **Evakuering** - Evakueringsplaner og rømningsveier
- 🔄 **Beredskapsplan** - Nødprosedyrer og varsling
- 🔄 **Øvelser** - Brannøvelser og dokumentasjon

**Total**: 4 undermeny

---

### 7. 🎓 Opplæring
**Kurs + Sertifikater**
- ✅ **Kurs** - Oversikt over kurs og opplæring
- 🔄 **Sertifikater** - Kursbevis og sertifikater
- 🔄 **Opplæringsplaner** - Planlegging av opplæring
- 🔄 **Bekreftelser** - Bekreftelser fra ansatte

**Total**: 4 undermeny

---

### 8. ⚠️ Hendelser
**Hendelser + Avvik**
- ✅ **Hendelseslogg** - Registrering av HMS-hendelser
- 🔄 **Avvik** - Avviksrapporter og oppfølging
- 🔄 **Tiltak** - Korrigerende og forebyggende tiltak
- 🔄 **Statistikk** - Statistikk og trendanalyser

**Total**: 4 undermeny

---

### 9. ✅ Internkontroll
**Revisjon + Kontroller**
- 🔄 **Internrevisjon** - HMS-runden og revisjonsrapporter
- 🔄 **Elektrisk anlegg** - Kontroll av elektriske anlegg
- ✅ **Vedlikehold** - Vedlikeholdsplaner og logg
- 🔄 **Sjekklister** - Sjekklister for alle kontroller

**Total**: 4 undermeny

---

### 10. 🌍 Miljø
**Miljø + Partnere**
- 🔄 **Miljøpolicy** - Miljøpolicy og mål
- 🔄 **Avfallshåndtering** - Kildesortering og resirkulering
- ✅ **Miljøpartnere** - LEKO Mater AS, NORVA AS
- 🔄 **Bærekraft** - Bærekraftsmål og energiforbruk

**Total**: 4 undermeny

---

### 11. 📁 Dokumenter
**Dokumenter + Tegninger**
- 🔄 **Dokumentarkiv** - Sentral dokumentbank
- 🔄 **Tegninger** - Layout og rømningsveier
- 🔄 **Kontrakter** - Serviceavtaler og kontrakter
- 🔄 **Korrespondanse** - Brev med Arbeidstilsynet

**Total**: 4 undermeny

---

### 12. ⚖️ Compliance
**Lovverk + GDPR**
- 🔄 **Lovverk** - Lover og forskrifter
- 🔄 **GDPR** - Personvernforordningen
- 🔄 **Sjekklister** - Compliance sjekklister
- 🔄 **Godkjenninger** - Sertifikater og godkjenninger

**Total**: 4 undermeny

---

### 13. 📊 Rapporter
**Rapporter + Statistikk**
- ✅ **Generer rapport** - Opprett nye rapporter
- ✅ **Rapportarkiv** - Historiske rapporter
- 🔄 **Statistikk** - Statistikk og analyser
- 🔄 **Eksporter** - Eksporter til PDF/Excel

**Total**: 4 undermeny

---

## 📊 Oppsummering

| Kategori | Hovedmoduler | Undermoduler | Implementert |
|----------|--------------|--------------|--------------|
| **Totalt** | 13 | 45 | ~20% |
| ✅ Ferdig | 5 | 8 | 100% |
| 🔄 Under utvikling | 2 | 6 | 30% |
| 📋 Planlagt | 6 | 31 | 0% |

---

## 🎨 Navigasjonsdesign

### Hierarki:
```
📊 Dashboard ▼
  ├─ Oversikt
  ├─ Analyser
  └─ Innsikt

🎯 Målsetting ▼
  ├─ HMS-mål
  ├─ Policyer
  └─ Organisasjonskart

🏢 Bedrift ▼
  ├─ Firmaopplysninger
  ├─ Kontakter
  ├─ Forsikringer
  └─ Verneombud

... (og så videre)
```

### Funksjoner:
- ✅ Expand/Collapse hver hovedmodul
- ✅ Emoji-ikoner for visuell identifikasjon
- ✅ Undermenyer med egne ikoner
- ✅ Aktiv tilstand (lilla/rosa gradient)
- ✅ Hover-effekter
- ✅ Responsive design
- ✅ Mobil hamburger-meny

---

## 🔑 Viktige Detaljer

### Implementerte Moduler (✅):

1. **Dashboard > Oversikt**
   - 4 statistikkort (Hendelser, Åpne saker, Kritiske, Compliance)
   - 3 trendkort (Ukentlig, Månedlig, Løste)
   - 2 grafer (Line Chart, Bar Chart)
   - Smart innsikt med AI-varsler

2. **Bedrift > Firmaopplysninger**
   - Komplett firmainfo for Amigos la Kokido AS
   - Redigerbar om-seksjon
   - Miljøpartnere (LEKO Mater AS, NORVA AS)
   - Tilpassbare seksjoner

3. **Opplæring > Kurs**
   - Kursregistrering
   - Deltakere
   - Status tracking

4. **Hendelser > Hendelseslogg**
   - Hendelsesregistrering
   - Kategorier (Sikkerhet/Miljø/Helse)
   - Alvorlighetsgrad (Lav/Middels/Høy/Kritisk)
   - Status og ansvarlig

5. **Rapporter > Generer/Arkiv**
   - HMS-rapporter
   - PDF-generering
   - Arkiv med søk

### Under Utvikling (🔄):

1. **Miljø > Miljøpartnere** (40% ferdig)
   - Database struktur klar
   - Frontend delvis implementert

2. **Internkontroll > Vedlikehold** (30% ferdig)
   - Grunnstruktur på plass

---

## 🚀 Utviklingsplan

### Fase 1: Ansatte (Uke 1-2)
- [ ] Ansattliste med full info
- [ ] Kontrakter og dokumenter
- [ ] Turnus/vaklister
- [ ] Fravær tracking
- [ ] Kompetanseoversikt

### Fase 2: Helse & Sikkerhet (Uke 2-3)
- [ ] BHT-avtale og kontaktinfo
- [ ] Førstehjelpsutstyr register
- [ ] Risikoanalyse med handlingsplaner
- [ ] Arbeidsmiljørutiner

### Fase 3: Beredskap (Uke 3-4)
- [ ] Branninstruks (norsk/arabisk)
- [ ] Evakueringsplaner med tegninger
- [ ] Beredskapsplan
- [ ] Øvelsesdokumentasjon

### Fase 4: Compliance (Uke 4-5)
- [ ] Lovverk database
- [ ] GDPR-dokumentasjon
- [ ] Sjekklister
- [ ] Godkjenninger og sertifikater

---

## 📞 Kontakt

**Amigos la Kokido AS**
- Org.nr: 929 603 14
- Daglig leder: Khalil Mahmod Sleman
- Telefon: +47 900 30 066
- E-post: order@amigoslakokido.com
- Adresse: Trondheimsveien 2, 0560 Oslo

---

## 📝 Tekniske Detaljer

### Stack:
- React + TypeScript
- Supabase (Database + RLS)
- Tailwind CSS
- Chart.js (Grafer)
- jsPDF (PDF-generering)

### Sikkerhet:
- Row Level Security (RLS)
- Soft delete for kritisk data
- Audit trail (created_at, updated_at)
- Validering på både frontend og backend

---

**Sist oppdatert**: 13. januar 2025
**Versjon**: 2.0 (Med undermeny)
