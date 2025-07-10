// pages/agent-dashboard/components/PerformanceMetrics.jsx
export default function PerformanceMetrics({ metrics }) {
  const stats = [
    { 
      title: "🏠 Total Listings", 
      value: metrics.totalListings,
      change: "+2 this month"
    },
    { 
      title: "✅ Vacant Listings", 
      value: metrics.vacantListings,
      change: metrics.vacantListings > 0 ? "Needs attention" : "All occupied"
    },
    { 
      title: "📊 Avg. Price (TZS)", 
      value: metrics.avgPrice,
      change: "+5.2% from last month"
    },
    { 
      title: "📈 Occupancy Rate", 
      value: metrics.occupancyRate,
      change: "Industry avg: 82%"
    }
  ];

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Performance Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-surface border border-border rounded-xl p-4 ${index === 1 && metrics.vacantListings > 0 ? "bg-warning-50" : ""}`}
          >
            <div className="text-lg text-text-secondary">{stat.title}</div>
            <div className="text-2xl font-bold text-text-primary my-2">{stat.value}</div>
            <div className="text-sm text-text-secondary">{stat.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}