import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorPage, NotFound } from "./pages/ErrorPage";
import { Home } from "./pages/Home";
import { AddContact } from "./pages/AddContact";
import { About } from "./pages/About";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { Otp } from "./pages/Otp";
import { ForgotPassword } from "./pages/ForgotPassword";
import AppLayout from "./components/layout/AppLayout";
import { Contact } from "./pages/Contact";
import { ViewContact } from "./pages/ViewContact";
import { EditContact } from "./pages/EditContact";
import { Profile } from "./pages/Profile";
import { Privacy } from "./pages/Privacy";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
      errorElement: <ErrorPage />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/addcontact", element: <AddContact /> },
        { path: "/about", element: <About /> },
        { path: "/contact", element: <Contact /> },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <SignUp /> },
        { path: "/otp", element: <Otp /> },
        { path: "/forgot-password", element: <ForgotPassword /> },
        { path: "/profile", element: <Profile /> },
        { path: "/privacy", element: <Privacy /> },
        { path: "/viewcontact/:id", element: <ViewContact /> },
        { path: "/editcontact/:id", element: <EditContact /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
};

export default App;
