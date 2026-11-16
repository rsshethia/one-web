const GITHUB_URL = 'https://github.com/rsshethia/one-web';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is this site?',
    a: 'An independent tracker of public job listings from Victorian councils. It scrapes each council\u2019s official careers page and shows every open role in one place — on a map and as a searchable list.',
  },
  {
    q: 'Where do the listings come from?',
    a: 'Directly from council websites and their official job boards (Pulse, Elmo, PageUp, Workday and others). We only collect the job title and a link — clicking a job takes you to the council\u2019s own portal to read details and apply. We never host applications.',
  },
  {
    q: 'How fresh is the data?',
    a: 'The snapshot date is shown on the List page. Data is refreshed each time the scraper runs (currently a manual local run, then the site is redeployed). A listing can close or fill between snapshots — always confirm on the council portal.',
  },
  {
    q: 'Why only Victoria?',
    a: 'We started with Victoria\u2019s 79 councils to get the pipeline right. Other states are planned next — the system is already built to grow state by state.',
  },
  {
    q: 'Are you affiliated with any council?',
    a: 'No. This is an independent project, not endorsed by any council. Council names and job titles belong to their respective owners.',
  },
  {
    q: 'Something looks wrong — a missing or odd job?',
    a: 'Boards change often and some block automated visits. Open an issue on the GitHub repo (link above) with the council name and what you see — reports go straight into the scraper\u2019s review queue.',
  },
  {
    q: 'How is the map coloured?',
    a: 'Each council area is shaded by its number of open roles: grey for none, deepening green for more. Click an area to filter to that council; click water to reset. Map rendering by Mapbox.',
  },
];

export default function About() {
  return (
    <div style={{ maxWidth: 760 }}>
      <h2 style={{ marginBottom: 8 }}>About — honest FAQ</h2>
      <p style={{ color: '#555', marginBottom: 16 }}>
        What this is, where the data comes from, and what it can\u2019t promise.
      </p>
      {FAQS.map((f, i) => (
        <details
          key={i}
          style={{ background: '#fff', border: '1px solid #e2e2e2', borderRadius: 8, marginBottom: 8, padding: '10px 14px' }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>{f.q}</summary>
          <p style={{ marginTop: 8, fontSize: 14, color: '#333', lineHeight: 1.55 }}>{f.a}</p>
        </details>
      ))}
      <p style={{ marginTop: 16, fontSize: 13, color: '#666' }}>
        Code and pipeline are open source:{' '}
        <a href={GITHUB_URL} target="_blank" rel="noopener" style={{ color: '#0b4ea2' }}>
          github.com/rsshethia/one-web
        </a>
      </p>
    </div>
  );
}

export { GITHUB_URL };
