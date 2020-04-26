const polka = require('polka');
const bodyParser = require('body-parser');
const { get } = require('dot-prop');
const qs = require('qs');

const PORT = process.env.PORT || 8080;

polka()
  .use(bodyParser.json())
  .post('/', async (req, res) => {
    const { payload: payloadRaw } = req.body.data[0].attributes;
    const payload = JSON.parse(payloadRaw);

    const formId = get(payload, 'data.relationships.form.data.id');
    const personId = get(payload, 'data.relationships.person.data.id');

    const formUrl = `https://api.planningcenteronline.com/people/v2/forms/${formId}`;
    const selfUrl = `${get(payload, 'data.links.self')}?${qs.stringify({
      include: 'person,form_fields,form_submission_values',
    })}`;
    const emailUrl = `https://api.planningcenteronline.com/people/v2/people/${personId}/email_addresses`;

    res.end();
  })
  .listen(PORT, () => console.log(`🥅 Running note catcher on port ${PORT}`));
