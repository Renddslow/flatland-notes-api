require('dotenv').config();
const polka = require('polka');
const bodyParser = require('body-parser');
const { get } = require('dot-prop');
const qs = require('qs');
const got = require('got');
const catchify = require('catchify');
const mandrill = require('mandrill-api/mandrill');

const renderMessage = require('./render');
const redact = require('./redact');
const getWeekendDate = require('./getWeekendDate');

const PORT = process.env.PORT || 8080;
const APP_ID = process.env.APP_ID;
const SECRET = process.env.SECRET;
const MANDRILL = process.env.MANDRILL;

const messenger = new mandrill.Mandrill(MANDRILL);

polka()
  .use(bodyParser.json())
  .post('/', async (req, res) => {
    const opt = {
      username: APP_ID,
      password: SECRET,
    };

    const { payload: payloadRaw } = req.body.data[0].attributes;
    const payload = JSON.parse(payloadRaw);

    const formId = get(payload, 'data.relationships.form.data.id');
    const personId = get(payload, 'data.relationships.person.data.id');

    const formUrl = `https://api.planningcenteronline.com/people/v2/forms/${formId}`;
    const selfUrl = `${get(payload, 'data.links.self')}?${qs.stringify({
      include: 'person,form_submission_values',
    })}`;
    const emailUrl = `https://api.planningcenteronline.com/people/v2/people/${personId}/emails`;

    const [formErr, formData] = await catchify(got(formUrl, opt).then((d) => JSON.parse(d.body)));
    if (formErr || !get(formData, 'data.attributes.name', '').includes('Sermon Notes')) {
      return res.end();
    }

    const [formFieldsErr, formFields] = await catchify(
      got(`${formUrl}/fields`, opt).then((d) => JSON.parse(d.body)),
    );
    if (formFieldsErr) return res.end();

    console.debug(`Fetching submission data`);
    const [submissionErr, submissionData] = await catchify(
      got(selfUrl, opt).then((d) => JSON.parse(d.body)),
    );
    if (submissionErr || !submissionData) return res.end();
    console.log(`Handling submission #${submissionData.data.id}`);

    console.debug(`Fetching user email address`);
    const [emailErr, emailData] = await catchify(
      got(emailUrl, opt).then((d) => JSON.parse(d.body)),
    );
    if (emailErr || !emailData) return res.end();

    const primaries = emailData.data.filter(({ attributes }) => attributes.primary);
    const emailAddress =
      primaries.length > 0 ? primaries[0].attributes.address : emailData.data[0].attributes.data;
    console.log(`Notes will be sent to ${redact(emailAddress)}`); // remove/redact before flight

    const emailBody = renderMessage(formData, formFields, submissionData);

    const message = {
      html: emailBody,
      to: [{ email: emailAddress }],
      from_email: 'noreply@flatland.church',
      from_name: 'Flatland Church Online',
      subject: `Your Notes for this Weekend (${getWeekendDate()})`,
      inline_css: true,
    };

    messenger.messages.send({ message });

    res.end();
  })
  .listen(PORT, () => console.log(`🥅 Running note catcher on port ${PORT}`));
