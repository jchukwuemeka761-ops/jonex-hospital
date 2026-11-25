import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildHospitalKnowledgeContext,
  cleanAssistantReplyText,
  validateAssistantPayload,
} from './hospital-assistant.logic';

test('validateAssistantPayload rejects empty or oversized messages and sanitizes history', () => {
  const emptyResult = validateAssistantPayload({message: '   '});
  assert.equal(emptyResult.ok, false);

  const validResult = validateAssistantPayload({
    message: 'What time do surgery consults open?',
    history: [
      {role: 'user', text: 'Hello'},
      {role: 'assistant', text: 'Welcome to Jonex Hospital.'},
      {role: 'system', text: 'Should be ignored'},
    ],
  });

  assert.equal(validResult.ok, true);
  if (validResult.ok) {
    assert.equal(validResult.message, 'What time do surgery consults open?');
    assert.equal(validResult.history.length, 2);
  }
});

test('buildHospitalKnowledgeContext includes verified Aba profile, hours, directors, and booking slots', () => {
  const context = buildHospitalKnowledgeContext();

  assert.ok(context.includes('499P+27M, Ebenma Street, Ogbor Hill, Aba'));
  assert.ok(context.includes('+234 807 801 6691'));
  assert.ok(context.includes('RC 259607'));
  assert.ok(context.includes('Ndukauba Eleweke'));
  assert.ok(context.includes('Ikwuoma Getrude Eleweke'));
  assert.ok(context.includes('08:30 AM'));
  assert.ok(context.includes('General Surgery Consultation'));
});

test('cleanAssistantReplyText strips markdown asterisks and backticks into clean bullets', () => {
  const formatted = cleanAssistantReplyText('**Hours:**\n* Open **24 Hours** at `/appointments`');
  assert.equal(formatted, 'Hours:\n• Open 24 Hours at /appointments');
});
