
export default function StatCard({ title, value, icon, className='' }){
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-icon">{icon||'◉'}</div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
