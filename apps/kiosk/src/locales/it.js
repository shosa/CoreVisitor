const it = {
  // KioskHome
  welcome: 'Benvenuto',
  checkin_title: 'CHECK-IN',
  checkin_desc: 'Inserisci il PIN a 4 cifre ricevuto via email',
  checkout_title: 'CHECK-OUT',
  checkout_desc: 'Scansiona o inserisci il numero badge per uscire',
  register_title: 'REGISTRATI',
  register_desc: 'Prima visita? Registrati e stampa il tuo badge',
  footer_pin_help: 'Non hai ricevuto il PIN? Contatta la reception',

  // PinEntry
  pin_page_title: 'Self Check-In',
  pin_card_title: 'Check-In con PIN',
  pin_card_desc: 'Inserisca il codice PIN a 4 cifre che le è stato comunicato',
  pin_label: 'Il tuo PIN',
  pin_loading_verify: 'Verifica in corso...',
  pin_confirm_title: 'Conferma i tuoi dati',
  pin_confirm_subtitle: 'Verifica che le informazioni siano corrette prima di procedere',
  pin_badge_label: 'Badge Visitatore',
  pin_field_date: 'Data',
  pin_field_dept: 'Dipartimento',
  pin_field_reason: 'Motivo',
  pin_field_host: 'Referente',
  pin_privacy: "Proseguendo con la registrazione dichiaro di aver letto e compreso l'Informativa Privacy ai sensi del Regolamento UE 2016/679.",
  pin_btn_confirm: 'Conferma Check-In',
  pin_btn_confirming: 'Check-in in corso...',
  pin_btn_cancel: 'Annulla',
  pin_success_title: 'Check-In Completato!',
  pin_success_msg: 'Benvenuto',
  pin_success_sub: 'Il tuo badge sta per essere stampato.\nRitiralo presso la reception.',
  pin_redirect: 'Reindirizzamento automatico in 5 secondi...',

  // ScanQR (Check-Out)
  qr_page_title: 'Self Check-Out',
  qr_card_title: 'Check-Out con Badge',
  qr_card_desc: 'Inserisca il numero a 6 cifre del suo badge per registrare l\'uscita',
  qr_badge_label: 'Il tuo numero badge',
  qr_loading_verify: 'Verifica in corso...',
  qr_confirm_title: 'Conferma l\'uscita',
  qr_confirm_subtitle: 'Verifica che le informazioni siano corrette prima di procedere',
  qr_badge_section_label: 'Badge Visitatore',
  qr_field_checkin: 'Check-in',
  qr_field_dept: 'Reparto',
  qr_field_host: 'Referente',
  qr_btn_confirm: 'Conferma Check-Out',
  qr_btn_confirming: 'Check-out in corso...',
  qr_btn_cancel: 'Annulla',
  qr_success_title: 'Check-Out Completato!',
  qr_success_msg: 'Arrivederci',
  qr_success_sub: 'La tua uscita è stata registrata con successo.',
  qr_redirect: 'Reindirizzamento automatico in 3 secondi...',

  // SelfRegister — Steps
  step_personal: 'Dati Personali',
  step_details: 'Dettagli Visita',
  step_summary: 'Riepilogo',

  // SelfRegister — Visit types
  visit_type_business: 'Business',
  visit_type_personal: 'Personale',
  visit_type_delivery: 'Consegna',
  visit_type_maintenance: 'Manutenzione',
  visit_type_interview: 'Colloquio',
  visit_type_other: 'Altro',

  // SelfRegister — Header
  sr_header_title: 'Registrazione Visitatore',

  // SelfRegister — Step 0
  sr_step0_title: 'I tuoi dati',
  sr_step0_subtitle: 'Sei già stato qui? Cerca il tuo nome, altrimenti compilare i campi',
  sr_search_label: 'Cerca il tuo nome (se sei già stato registrato)',
  sr_search_placeholder: 'Inizia a digitare nome o cognome...',
  sr_divider: 'oppure inserisci i tuoi dati',
  sr_field_firstname: 'Nome *',
  sr_field_lastname: 'Cognome *',
  sr_field_company: 'Azienda',
  sr_field_email: 'Email',
  sr_placeholder_firstname: 'Es. Mario',
  sr_placeholder_lastname: 'Es. Rossi',
  sr_placeholder_company: 'Nome azienda (opzionale)',
  sr_placeholder_email: 'email@esempio.it (opzionale)',
  sr_visitor_found: 'Visitatore trovato',

  // SelfRegister — Step 1
  sr_step1_title: 'Dettagli visita',
  sr_step1_subtitle: 'Seleziona il referente e il tipo di visita',
  sr_host_label: 'Referente da incontrare *',
  sr_host_placeholder: 'Seleziona il referente...',
  sr_dept_prefix: 'Reparto:',
  sr_visit_type_label: 'Tipo di Visita *',
  sr_purpose_label: 'Motivo visita',
  sr_purpose_placeholder: 'Motivo (opzionale)',

  // SelfRegister — Step 2
  sr_step2_title: 'Riepilogo e conferma',
  sr_step2_subtitle: 'Verifica i tuoi dati prima di procedere',
  sr_summary_visitor: 'Visitatore',
  sr_summary_company: 'Azienda',
  sr_summary_host: 'Referente',
  sr_summary_dept: 'Reparto',
  sr_summary_visit_type: 'Tipo visita',
  sr_summary_reason: 'Motivo',
  sr_gdpr_text: 'Ai sensi del Regolamento UE 2016/679 (GDPR), i tuoi dati personali saranno trattati da {company} esclusivamente per la gestione degli accessi e la sicurezza aziendale. I dati non saranno ceduti a terzi e saranno conservati per il tempo strettamente necessario. Hai diritto di accesso, rettifica e cancellazione dei tuoi dati contattando la reception.',
  sr_consent: 'Premendo Conferma e Stampa Badge dichiari di aver letto e accettato il trattamento dei dati personali ai sensi del GDPR.',

  // SelfRegister — Navigation
  sr_btn_back: 'Indietro',
  sr_btn_next: 'Avanti',
  sr_btn_submit: 'Conferma e Stampa Badge',
  sr_btn_submitting: 'Registrazione...',
  sr_btn_home: 'Torna alla home',

  // SelfRegister — Success
  sr_success_title: 'Registrazione completata!',
  sr_success_subtitle: 'Benvenuto',
  sr_badge_label: 'Il tuo numero badge',
  sr_badge_note: 'Il badge è in fase di stampa',
  sr_countdown: 'Ritorno alla home in {n}s...',

  // SelfRegister — Loading
  sr_loading: 'Caricamento...',

  // SelfRegister — Errors
  sr_err_name: 'Inserisci nome e cognome oppure cerca il tuo nome nel campo di ricerca',
  sr_err_visit_type: 'Seleziona il tipo di visita',
  sr_err_host: 'Seleziona il referente da incontrare',
  sr_err_dept: 'Il referente selezionato non ha un reparto assegnato. Contatta la reception.',
  sr_err_submit: 'Errore durante la registrazione. Riprova.',
};

export default it;
