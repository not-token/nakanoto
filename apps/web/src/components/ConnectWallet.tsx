import { showConnect } from "@stacks/connect"

import { userSession } from "../user-session"

function authenticate() {
  showConnect({
    appDetails: {
      name: "NAKANOTO",
      icon: window.location.origin + import.meta.env.BASE_URL + "/wmno.png",
    },
    redirectTo: "/",
    onFinish: () => {
      window.location.reload()
    },
    userSession,
  })
}

function disconnect() {
  userSession.signUserOut(import.meta.env.BASE_URL)
}

function ConnectWallet() {
  if (userSession.isUserSignedIn()) {
    return (
      <div>
        <button className="Connect" onClick={disconnect} type="button">
          Disconnect Wallet
        </button>
        {/* <p>mainnet: {userSession.loadUserData().profile.stxAddress.mainnet}</p>
        <p>testnet: {userSession.loadUserData().profile.stxAddress.testnet}</p> */}
      </div>
    )
  }

  return (
    <button className="Connect" onClick={authenticate} type="button">
      Connect Wallet
    </button>
  )
}

export default ConnectWallet
