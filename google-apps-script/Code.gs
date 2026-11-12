const CONFIG = {
  NOTIFICATION_EMAIL: 'bay.nv@ou.edu.vn',
  SPREADSHEET_NAME: 'TIIS Website Form Submissions',
  ALLOWED_ORIGINS: ['https://tiis-consortium.org', 'https://www.tiis-consortium.org']
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Bridge')
    .setTitle('TIIS Form Service')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function processSubmission(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid submission.');
  if (String(payload.website || '').trim()) throw new Error('Submission rejected.');

  const type = String(payload['Submission type'] || '');
  const isEOI = type === 'Membership expression of interest';
  const isInquiry = type === 'General inquiry';
  if (!isEOI && !isInquiry) throw new Error('Unknown form type.');

  const fields = isEOI
    ? ['Institution', 'Faculty / Department', 'Country', 'Interest', 'Contact person', 'email']
    : ['Name', 'Institution', 'email', 'Message'];

  const clean = {};
  fields.forEach((key) => {
    const value = String(payload[key] || '').trim();
    if (!value) throw new Error('Please complete all required fields.');
    if (value.length > (key === 'Message' ? 5000 : 254)) throw new Error('A submitted field is too long.');
    clean[key] = value;
  });

  const email = clean.email;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please provide a valid email address.');

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  let reference;
  let timestamp;
  try {
    const sheet = getOrCreateSheet_();
    timestamp = new Date();
    reference = (isEOI ? 'TIIS-' : 'INQ-') + Utilities.getUuid().slice(0, 8).toUpperCase();
    const row = [
      timestamp,
      reference,
      type,
      safeCell_(clean['Institution']),
      safeCell_(clean['Faculty / Department']),
      safeCell_(clean['Country']),
      safeCell_(clean['Interest']),
      safeCell_(clean['Contact person']),
      safeCell_(clean.email),
      safeCell_(clean['Name']),
      safeCell_(clean['Message'])
    ];
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  const subject = isEOI ? 'New TIIS membership expression of interest' : 'New TIIS website inquiry';
  const lines = [
    'A new submission was received through the TIIS Consortium website.',
    '',
    'Reference: ' + reference,
    'Form: ' + type,
    'Received: ' + timestamp.toISOString(),
    ''
  ].concat(fields.map((key) => key + ': ' + clean[key]));
  let emailSent = true;
  try {
    MailApp.sendEmail({
      to: CONFIG.NOTIFICATION_EMAIL,
      replyTo: email,
      subject: subject + ' [' + reference + ']',
      body: lines.join('\n'),
      name: 'TIIS Consortium Website'
    });
  } catch (error) {
    emailSent = false;
    console.error('Email notification failed for ' + reference + ': ' + error);
  }

  return {
    ok: true,
    reference: reference,
    emailNotification: emailSent ? 'sent' : 'failed',
    message: emailSent
      ? 'Your submission has been recorded and the Secretariat has been notified.'
      : 'Your submission has been recorded, but the email notification could not be sent.'
  };
}

function getOrCreateSheet_() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheetId = properties.getProperty('TIIS_SPREADSHEET_ID');
  let spreadsheet;
  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
    properties.setProperty('TIIS_SPREADSHEET_ID', spreadsheet.getId());
  }

  let sheet = spreadsheet.getSheetByName('Submissions');
  if (!sheet) sheet = spreadsheet.insertSheet('Submissions');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Reference', 'Submission type', 'Institution', 'Faculty / Department', 'Country', 'Interest', 'Contact person', 'Email', 'Name', 'Message']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
    sheet.autoResizeColumns(1, 11);
  }
  return sheet;
}

function safeCell_(value) {
  const text = String(value || '');
  return /^[=+@\\-\\t\\r]/.test(text) ? "'" + text : text;
}
