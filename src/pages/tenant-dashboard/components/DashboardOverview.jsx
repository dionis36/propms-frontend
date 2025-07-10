// pages/tenant-dashboard/components/DashboardOverview.jsx
export default function DashboardOverview() {
  const metrics = [
    { title: 'Total Favorites', value: 12, icon: '❤️' },
    { title: 'Active Applications', value: 3, icon: '📝' },
    { title: 'Viewings Scheduled', value: 2, icon: '👁️' },
    { title: 'Messages', value: 5, icon: '💬' },
  ];

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-surface border border-border rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">{metric.icon}</div>
            <div className="text-3xl font-bold text-primary">{metric.value}</div>
            <div className="text-sm text-text-secondary mt-1">{metric.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}