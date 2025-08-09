// pages/tenant-dashboard/components/WelcomeBanner.jsx
import Icon from '../../../components/AppIcon'; 

export default function WelcomeBanner({ name }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = today.toLocaleDateString('en-US', options);

  return (
    <div className="card p-6 bg-gradient-to-r from-primary-100 to-accent-50">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {getGreeting()}, <span className="text-primary">{name}</span> 👋
          </h1>
          <p className="text-text-secondary mt-2">
            {dateString}
          </p>
        </div>
        <div className="bg-primary-100 rounded-full p-3 text-primary">
          <Icon name="Home" className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}