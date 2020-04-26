const { get } = require('dot-prop');

const heading = require('./components/heading');
const text = require('./components/text');
const input = require('./components/input');

const style = `
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    padding: 0;
    margin: 0;
    line-height: 1.5;
  }

  p {
    white-space: pre-line;
    margin: 0;
    padding: 0;
  }

  h1 {
    margin: 24px 0 8px;
    display: block;
    padding: 0;
    font-size: 28px;
  }

  h2 {
    font-size: 18px;
    font-weight: 700;
    margin: 24px 0 8px;
    padding-top: 24px;
    border-top: 1px solid #eee;
  }

  .message {
    max-width: 550px;
    width: 100%;
    padding: 24px 12px;
    box-sizing: border-box;
    background: #f9f9fc;
    border-radius: 4px;
  }

  .message p:first-child {
    margin-bottom: 8px;
  }

  .wrapper {
    max-width: 550px;
    width: 100%;
    padding: 12px;
    box-sizing: border-box;
  }

  .form-control {
    margin: 24px 0;
    display: block;
    position: relative;
  }

  .form-control__label {
    font-weight: 600;
    margin-bottom: 8px;
  }

  .form-control__input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    display: block;
    border: 2px solid #e9e9ef;
    border-radius: 4px;
  }

  .form-control__text {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    display: block;
    border: 2px solid #e9e9ef;
    border-radius: 4px;
    min-height: 90px;
  }
</style>
`;

module.exports = (form, fields, submission) => {
  const submissionValues = submission.included
    .filter(({ type }) => type === 'FormSubmissionValue')
    .reduce((acc, value) => {
      acc[get(value, 'relationships.form_field.data.id')] = get(
        value,
        'attributes.display_value',
        '',
      );
      return acc;
    }, {});

  const person = submission.included.filter(({ type }) => type === 'Person');
  const firstName = get(person, '0.attributes.first_name', '');

  const greeting = `${`Hey ${firstName}`.trim()},`;

  const sections = fields.data
    .filter(({ attributes }) => attributes.field_type !== 'workflow_checkboxes')
    .sort((a, b) => {
      if (a.attributes.sequence > b.attributes.sequence) return 1;
      if (b.attributes.sequence > a.attributes.sequence) return -1;
      return 0;
    })
    .map(({ attributes, id }) => {
      if (attributes.field_type === 'heading') return heading(attributes);
      if (attributes.field_type === 'string' || attributes.field_type === 'dropdown')
        return input(attributes, submissionValues[id]);
      if (attributes.field_type === 'text') return text(attributes, submissionValues[id]);
    });

  const header = `<div><h1>${form.data.attributes.name}</h1>\n<p>${form.data.attributes.description}</p>`;
  const noteBody = `<div class="wrapper">${header}\n${sections.join('\n')}</div>`;

  const message = `<div class="message"><p>${greeting}</p>\n<p>Thanks so much for joining us for worship this week. Here are your saved notes from today's message.</p></div>`;

  return `${style}<div>${message}\n${noteBody}</div>`;
};
