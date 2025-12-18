import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import '@mysten/dapp-kit/dist/index.css'

const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
}

export function Providers({ children }) {
  return (
    <SuiClientProvider networks={networks} defaultNetwork="devnet">
      <WalletProvider autoConnect>
        {children}
      </WalletProvider>
    </SuiClientProvider>
  )
}
