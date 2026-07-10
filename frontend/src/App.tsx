
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
