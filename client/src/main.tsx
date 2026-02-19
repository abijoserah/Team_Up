import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import router from "./router";
import { AuthProvider } from "./context/AuthContext";

const rootElement = document.getElementById("root");
if (rootElement == null) {
  throw new Error(`Your HTML Document should contain a <div id="root"></div>`);
}

createRoot(rootElement).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>,
);
