import { createBrowserRouter } from "react-router";
import App from "./App.tsx";
import Activities from "./pages/Activities";
import ActivityDetails from "./pages/ActivityDetails";
import ActivityForm from "./pages/ActivityForm";
import MyActivities from "./pages/MyActivities.tsx";
import SignUp from "./pages/SignUp.tsx";
import Home from "./pages/Home.tsx";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/publication",
        element: <ActivityForm />,
      },
      {
        path: "/activities/page/:page",
        element: <Activities />,
      },
      {
        path: "/activities/:id",
        element: <ActivityDetails />,
      },
      {
        path: "/my-activities",
        element: <MyActivities />,
      },
      {
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
]);

export default router;
