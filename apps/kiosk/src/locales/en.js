const en = {
  // KioskHome
  welcome: 'Welcome',
  checkin_title: 'CHECK-IN',
  checkin_desc: 'Enter your 4-digit PIN received by email',
  checkout_title: 'CHECK-OUT',
  checkout_desc: 'Scan or enter your badge number to check out',
  register_title: 'REGISTER',
  register_desc: 'First visit? Register and print your badge',
  footer_pin_help: "Didn't receive your PIN? Contact reception",

  // PinEntry
  pin_page_title: 'Self Check-In',
  pin_card_title: 'Check-In with PIN',
  pin_card_desc: 'Enter the 4-digit PIN you received',
  pin_label: 'Your PIN',
  pin_loading_verify: 'Verifying...',
  pin_confirm_title: 'Confirm your details',
  pin_confirm_subtitle: 'Please verify the information is correct before proceeding',
  pin_badge_label: 'Visitor Badge',
  pin_field_date: 'Date',
  pin_field_dept: 'Department',
  pin_field_reason: 'Purpose',
  pin_field_host: 'Host',
  pin_privacy: 'By proceeding I confirm I have read and understood the Privacy Policy pursuant to EU Regulation 2016/679.',
  pin_btn_confirm: 'Confirm Check-In',
  pin_btn_confirming: 'Checking in...',
  pin_btn_cancel: 'Cancel',
  pin_success_title: 'Check-In Complete!',
  pin_success_msg: 'Welcome',
  pin_success_sub: 'Your badge is being printed.\nPlease collect it at reception.',
  pin_redirect: 'Redirecting automatically in 5 seconds...',

  // ScanQR (Check-Out)
  qr_page_title: 'Self Check-Out',
  qr_card_title: 'Check-Out with Badge',
  qr_card_desc: 'Enter the 6-digit number on your badge to register your departure',
  qr_badge_label: 'Your badge number',
  qr_loading_verify: 'Verifying...',
  qr_confirm_title: 'Confirm departure',
  qr_confirm_subtitle: 'Please verify the information is correct before proceeding',
  qr_badge_section_label: 'Visitor Badge',
  qr_field_checkin: 'Check-in',
  qr_field_dept: 'Department',
  qr_field_host: 'Host',
  qr_btn_confirm: 'Confirm Check-Out',
  qr_btn_confirming: 'Checking out...',
  qr_btn_cancel: 'Cancel',
  qr_success_title: 'Check-Out Complete!',
  qr_success_msg: 'Goodbye',
  qr_success_sub: 'Your departure has been successfully recorded.',
  qr_redirect: 'Redirecting automatically in 3 seconds...',

  // SelfRegister — Steps
  step_personal: 'Personal Data',
  step_details: 'Visit Details',
  step_summary: 'Summary',

  // SelfRegister — Visit types
  visit_type_business: 'Business',
  visit_type_personal: 'Personal',
  visit_type_delivery: 'Delivery',
  visit_type_maintenance: 'Maintenance',
  visit_type_interview: 'Interview',
  visit_type_other: 'Other',

  // SelfRegister — Header
  sr_header_title: 'Visitor Registration',

  // SelfRegister — Step 0
  sr_step0_title: 'Your details',
  sr_step0_subtitle: 'Have you been here before? Search your name, otherwise fill in the fields',
  sr_search_label: 'Search your name (if you have been registered before)',
  sr_search_placeholder: 'Start typing your first or last name...',
  sr_divider: 'or enter your details',
  sr_field_firstname: 'First name *',
  sr_field_lastname: 'Last name *',
  sr_field_company: 'Company',
  sr_field_email: 'Email',
  sr_placeholder_firstname: 'e.g. John',
  sr_placeholder_lastname: 'e.g. Smith',
  sr_placeholder_company: 'Company name (optional)',
  sr_placeholder_email: 'email@example.com (optional)',
  sr_visitor_found: 'Visitor found',

  // SelfRegister — Step 1
  sr_step1_title: 'Visit details',
  sr_step1_subtitle: 'Select your host and visit type',
  sr_host_label: 'Host to meet *',
  sr_host_placeholder: 'Select a host...',
  sr_dept_prefix: 'Department:',
  sr_visit_type_label: 'Visit Type *',
  sr_purpose_label: 'Visit purpose',
  sr_purpose_placeholder: 'Purpose (optional)',

  // SelfRegister — Step 2
  sr_step2_title: 'Summary & confirmation',
  sr_step2_subtitle: 'Review your details before proceeding',
  sr_summary_visitor: 'Visitor',
  sr_summary_company: 'Company',
  sr_summary_host: 'Host',
  sr_summary_dept: 'Department',
  sr_summary_visit_type: 'Visit type',
  sr_summary_reason: 'Purpose',
  sr_gdpr_text: 'Pursuant to EU Regulation 2016/679 (GDPR), your personal data will be processed by {company} solely for the management of access and company security. Data will not be disclosed to third parties and will be retained only as long as necessary. You have the right to access, rectify and delete your data by contacting reception.',
  sr_consent: 'By pressing Confirm & Print Badge you confirm you have read and accepted the processing of your personal data under GDPR.',

  // SelfRegister — Navigation
  sr_btn_back: 'Back',
  sr_btn_next: 'Next',
  sr_btn_submit: 'Confirm & Print Badge',
  sr_btn_submitting: 'Registering...',
  sr_btn_home: 'Back to home',

  // SelfRegister — Success
  sr_success_title: 'Registration complete!',
  sr_success_subtitle: 'Welcome',
  sr_badge_label: 'Your badge number',
  sr_badge_note: 'Your badge is being printed',
  sr_countdown: 'Returning to home in {n}s...',

  // SelfRegister — Loading
  sr_loading: 'Loading...',

  // SelfRegister — Errors
  sr_err_name: 'Please enter your first and last name or search for your name',
  sr_err_visit_type: 'Please select a visit type',
  sr_err_host: 'Please select a host to meet',
  sr_err_dept: 'The selected host has no department assigned. Please contact reception.',
  sr_err_submit: 'Registration error. Please try again.',
};

export default en;
