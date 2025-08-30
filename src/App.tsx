// Remove unused React import for newer React versions
import { AppLayout } from './components/Layout';
import './App.css';

function App() {
    return (
        <div className="pf-v6-theme-dark">
            <AppLayout />
        </div>
    );
}

export default App;
