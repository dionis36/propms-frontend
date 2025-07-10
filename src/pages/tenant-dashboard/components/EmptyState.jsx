// pages/tenant-dashboard/components/EmptyState.jsx
export default function EmptyState({ title, description, actionText }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto bg-secondary-100 rounded-full p-4 w-16 h-16 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-medium text-text-primary">{title}</h3>
      <p className="mt-1 text-text-secondary max-w-md mx-auto">{description}</p>
      <div className="mt-6">
        <button className="btn-primary px-4 py-2 rounded-md">
          {actionText}
        </button>
      </div>
    </div>
  );
}