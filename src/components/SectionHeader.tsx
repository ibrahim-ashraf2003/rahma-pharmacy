interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  viewAll?: boolean;
}

export default function SectionHeader({ title, subtitle, tabs, activeTab, onTabChange, viewAll }: SectionHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-8 text-center md:text-left">
      <div className="flex flex-col items-center md:items-start">
        <h2 className="font-headline text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">{title}</h2>
        <div className="w-12 h-1 bg-black rounded-full mb-4" />
        {subtitle && <p className="text-gray-500 uppercase tracking-widest text-[10px] md:text-xs mb-4 font-bold">{subtitle}</p>}
        {tabs && (
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button 
                key={tab}
                onClick={() => onTabChange?.(tab)}
                className={`${activeTab === tab ? 'text-black font-black border-b-2 border-black' : 'text-gray-400 font-bold hover:text-black'} transition-colors text-sm md:text-lg uppercase tracking-widest`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>
      {viewAll && (
        <a className="bg-black text-white px-8 py-3 rounded-full font-black tracking-[0.2em] text-[10px] uppercase hover:bg-gray-900 transition-all shadow-lg active:scale-95" href="#">
          View All
        </a>
      )}
    </div>
  );
}
