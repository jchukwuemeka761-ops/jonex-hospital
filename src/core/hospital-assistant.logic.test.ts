import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildHospitalKnowledgeContext,
  cleanAssistantReplyText,
  validateAssistantPayload,
} from './hospital-assistant.logic.ts';

test('validateAssistantPayload enforces non-empty length bounds and sanitizes history', () => {
  assert.equal(validateAssistantPayload(null).ok, false);
  assert.equal(validateAssistantPayload({message: '   '}).ok, false);
  assert.equal(validateAssistantPayload({message: 'a'.repeat(1201)}).ok, false);

  const valid = validateAssistantPayload({
    message: '  What are your opening hours?  ',
    history: [
      {role: 'user', text: 'Hello'},
      {role: 'invalid', text: 'Ignore me'},
      {role: 'assistant', text: 'Welcome to Jonex Hospital'},
    ],
  });
  assert.equal(valid.ok, true);
  if (!valid.ok) {
    return;
  }
  assert.equal(valid.message, 'What are your opening hours?');
  assert.equal(valid.history.length, 2);
});

test('cleanAssistantReplyText strips markdown emphasis and backticks cleanly', () => {
  const cleaned = cleanAssistantReplyText('**Open 24 Hours**\n* Call `+234 807 801 6691`');
  assert.equal(cleaned, 'Open 24 Hours\n• Call +234 807 801 6691');
});

test('buildHospitalKnowledgeContext includes verified Aba location, directors, and services', () => {
  const ctx = buildHospitalKnowledgeContext();
  assert.match(ctx, /Ebenma Street, Ogbor Hill, Aba/);
  assert.match(ctx, /RC 259607/);
  assert.match(ctx, /Ndukauba Eleweke/);
  assert.match(ctx, /General Surgery Consultation/);
});
