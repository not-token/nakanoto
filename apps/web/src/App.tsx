import ConnectWallet from "./components/ConnectWallet"
import Lock from "./components/Lock"
import { userSession } from "./user-session"

function App() {
  return (
    <>
      <div className="mb-12">
        <h1 className="mb-4 text-3xl font-bold text-center text-gray-800 dark:text-gray-200">
          NAKANOTO UPGRADE
        </h1>
        {/* <h2></h2> */}
      </div>

      <ConnectWallet />
      {userSession.isUserSignedIn() && <Lock />}
    </>
  )
}

export default App
