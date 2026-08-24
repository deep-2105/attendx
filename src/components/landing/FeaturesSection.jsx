
export default function FeaturesSection() {
  return (
    <section className="lp-section lp-product-features">
      <div className="lp-container">
        <h2 className="lp-section-title dark">Powerful workflows for modern campuses.</h2>

        <div className="lp-product-grid">
          <article className="lp-product-card">
            <h3>Attendance Intelligence</h3>
            <p>Instant attendance status, trend visibility, and predictive insight for every student.</p>
          </article>

          <article className="lp-product-card">
            <h3>Classroom Control</h3>
            <p>Manage attendance sessions, monitor class performance, and identify risks early.</p>
          </article>

          <article className="lp-product-card">
            <h3>Reports & Analytics</h3>
            <p>Generate actionable reports and improve academic outcomes through data-backed decisions.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
