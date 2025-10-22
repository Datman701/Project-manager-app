import { Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/index.js';
import ToastContainer from './components/common/ToastContainer.jsx';
import AuthInitializer from './components/auth/AuthInitializer.jsx';

function App() {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <div className="min-h-screen bg-gray-50">
        <Outlet />
        <ToastContainer />
      </div>
    </Provider>
  );
}

export default App;
