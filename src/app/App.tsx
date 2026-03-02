import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from "next-themes";
import { Toaster } from "./components/ui/sonner";
import { Provider } from 'react-redux';
import { store } from './store';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="size-full">
          <RouterProvider router={router} />
          <Toaster />
        </div>
      </ThemeProvider>
    </Provider>
  );
}
