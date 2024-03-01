import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.js"
import "./index.css"

import { Connect } from "@stacks/connect-react"

import { userSession } from "./user-session.js"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
const queryClient = new QueryClient()
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Connect
      authOptions={{
        appDetails: {
          name: "NAKANOTO",
          icon: window.location.origin + import.meta.env.BASE_URL + "/wmno.png",
        },
        redirectTo: "/",
        onFinish: () => {
          window.location.reload()
        },
        userSession,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Connect>
  </React.StrictMode>,
)
