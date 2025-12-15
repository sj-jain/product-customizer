import { RotateCcw, Download, Info, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

function Toolbar() {
  const { reset, meshCustomizations } = useAppStore();

  const handleReset = () => {
    if (confirm('Reset all customizations?')) {
      reset();
    }
  };

  const handleExport = () => {
    // Future: Export customization data
    console.log('Customizations:', meshCustomizations);
    alert('Export functionality coming soon!');
  };

  return (
    <div className="absolute top-4 left-16 flex gap-2 z-40">
      <button
        onClick={handleReset}
        className="px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
        title="Reset"
      >
        <RotateCcw size={18} />
        <span>Reset</span>
      </button>
      
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
        title="Export"
      >
        <Download size={18} />
        <span>Export</span>
      </button>
      
      <Link
        to="/documentation"
        className="px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
        title="Documentation"
      >
        <Book size={18} />
        <span>Docs</span>
      </Link>
    </div>
  );
}

export default Toolbar;

