// pages/agent-dashboard/components/PerformanceMetrics.jsx
export default function PerformanceMetrics({ metrics }) {
  const { totalListings, vacantListings, occupiedListings, avgPrice } = metrics;

  // Calculate percentage values
  const vacantRate = totalListings > 0 ? Math.round((vacantListings / totalListings) * 100) : 0;
  const occupiedRate = totalListings > 0 ? Math.round((occupiedListings / totalListings) * 100) : 0;

const stats = [
  {
    title: "Total Listings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l1.553-1.276A2 2 0 015.894 8h12.212a2 2 0 011.341.724L21 10m-18 0v10a2 2 0 002 2h14a2 2 0 002-2V10m-18 0L12 3l9 7" />
      </svg>
    ),
    value: totalListings,
    change: `${totalListings > 0 ? "+100%" : "0%"}`
  },
  {
    title: "Vacant",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a8 8 0 11-16 0 8 8 0 0116 0z" />
      </svg>
    ),
    value: vacantListings,
    change: `${vacantRate}%`
  },
  {
    title: "Occupied",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    ),
    value: occupiedListings,
    change: `${occupiedRate}%`
  },
  {
    title: "Avg. Price",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V7a4 4 0 118 0v4m-4 8v-4m-6 4a6 6 0 0012 0V7a6 6 0 00-12 0v12z" />
      </svg>
    ),
    value: metrics.avgPrice,
    change: (() => {
      if (metrics.avg >= 1000000) {
        return `${(metrics.avg / 1000000).toFixed(1)}M avg`;
      } else if (metrics.avg >= 1000) {
        return `${Math.round(metrics.avg / 1000)}K avg`;
      } else {
        return `${metrics.avg} avg`;
      }
    })()
  }
];



  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Performance Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-surface border border-border rounded-xl p-4 ${
              stat.title.includes("Vacant") && vacantListings > 0 ? "bg-warning-50" : ""
            }`}
          >
            <div className="flex items-center gap-2 text-lg text-text-secondary">
              {stat.icon}
              <span>{stat.title}</span>
            </div>

            <div className="text-2xl font-bold text-text-primary my-2">{stat.value}</div>
            <div className="text-sm text-text-secondary">{stat.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
