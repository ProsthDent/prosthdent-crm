const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

 const sql = neon(postgresql://netlifydb_owner:npg_0ECn2YwayKzZ@ep-late-math-ajmuhzcv.c-3.us-east-2.db.netlify.com/netlifydb?sslmode=require);

  await sql`CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    fname TEXT, lname TEXT, phone TEXT, email TEXT,
    source TEXT, treatment TEXT, status TEXT DEFAULT 'New',
    value NUMERIC, referrer TEXT, followup TEXT,
    followup_note TEXT, od BOOLEAN DEFAULT FALSE,
    notes TEXT, date_added DATE DEFAULT CURRENT_DATE,
    log JSONB DEFAULT '[]'
  )`;

  if (event.httpMethod === 'GET') {
    const leads = await sql`SELECT * FROM leads ORDER BY date_added DESC, id DESC`;
    return { statusCode: 200, headers, body: JSON.stringify(leads) };
  }

  if (event.httpMethod === 'POST') {
    const d = JSON.parse(event.body);
    const lead = await sql`
      INSERT INTO leads (fname, lname, phone, email, source, treatment, status, value, referrer, followup, followup_note, od, notes, log)
      VALUES (${d.fname||''}, ${d.lname||''}, ${d.phone||''}, ${d.email||''}, ${d.source||'Other'}, ${d.treatment||'General / exam'}, ${d.status||'New'}, ${d.value||0}, ${d.referrer||''}, ${d.followup||''}, ${d.followup_note||''}, ${d.od||false}, ${d.notes||''}, ${JSON.stringify(d.log||[{ts: new Date().toLocaleString(), text: 'Lead created — source: '+(d.source||'Other')}])})
      RETURNING *`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, lead: lead[0] }) };
  }

  if (event.httpMethod === 'PATCH') {
    const d = JSON.parse(event.body);
    const lead = await sql`
      UPDATE leads SET fname=${d.fname}, lname=${d.lname}, phone=${d.phone}, email=${d.email},
      source=${d.source}, treatment=${d.treatment}, status=${d.status}, value=${d.value},
      referrer=${d.referrer}, followup=${d.followup}, followup_note=${d.followup_note},
      od=${d.od}, notes=${d.notes}, log=${JSON.stringify(d.log)}
      WHERE id=${d.id} RETURNING *`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, lead: lead[0] }) };
  }

  if (event.httpMethod === 'DELETE') {
    const { id } = JSON.parse(event.body);
    await sql`DELETE FROM leads WHERE id=${id}`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 405, headers, body: 'Method not allowed' };
};
