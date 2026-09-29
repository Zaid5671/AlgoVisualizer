export function AlgorithmInfo({ activeAlgorithm }) {
  if (!activeAlgorithm?.applications) return null;

  return (
    <section className="algo-info">
      <span className="eyebrow">learn more</span>
      <div className="algo-info__grid">
        <article className="algo-info__card">
          <h3>Description</h3>
          <p>{activeAlgorithm.description}</p>
        </article>

        <article className="algo-info__card">
          <h3>Applications</h3>
          <ul>
            {activeAlgorithm.applications.map((app) => (
              <li key={app}>{app}</li>
            ))}
          </ul>
        </article>

        <article className="algo-info__card">
          <h3>Time complexity</h3>
          <p>
            Watch a short visual explanation of {activeAlgorithm.name.toLowerCase()} and its Big O behavior.
          </p>
          <a className="feature-video-link" href={activeAlgorithm.video} target="_blank" rel="noreferrer">
            Watch video →
          </a>
        </article>
      </div>
    </section>
  );
}
