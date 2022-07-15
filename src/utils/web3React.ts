import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { TorusConnector } from '@web3-react/torus-connector'
import { BscConnector } from '@binance-chain/bsc-connector'
import { ConnectorNames } from '@ape.swap/uikit'
import getRpcUrl from 'utils/getRpcUrl'
import { CHAIN_ID } from 'config/constants/chains'
import { Web3Provider } from '@ethersproject/providers'
import { UAuthConnector } from '@uauth/web3-react'
import UAuth from '@uauth/js'

const POLLING_INTERVAL = 15000

// When adding a new chain we need to add the CHAIN_ID to the supported chains

const injected = new InjectedConnector({
  supportedChainIds: [CHAIN_ID.BSC, CHAIN_ID.BSC_TESTNET, CHAIN_ID.MATIC, CHAIN_ID.MATIC_TESTNET, CHAIN_ID.ETH],
})

const walletconnect = new WalletConnectConnector({
  rpc: { [CHAIN_ID.BSC]: getRpcUrl(CHAIN_ID.BSC) },
  supportedChainIds: [CHAIN_ID.BSC, CHAIN_ID.BSC_TESTNET, CHAIN_ID.MATIC, CHAIN_ID.MATIC_TESTNET, CHAIN_ID.ETH],
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
})

const bscConnector = new BscConnector({ supportedChainIds: [CHAIN_ID.BSC] })
const torus = new TorusConnector({ chainId: CHAIN_ID.BSC, initOptions: { network: { host: 'bsc_mainnet' } } })

export const walletlink = new WalletLinkConnector({
  url: getRpcUrl(CHAIN_ID.BSC),
  supportedChainIds: [CHAIN_ID.BSC],
  appName: 'Apeswap',
  darkMode: true,
  appLogoUrl: 'https://apeswap.finance/logo.png',
})

console.log('windowLocationOrigin', window.location.origin)
console.log('windowLocationOrigin', process.env.REACT_APP_UD_REDIRECT_URI)
export const uauth = new UAuthConnector({
  uauth: new UAuth({
    clientID: process.env.REACT_APP_UD_CLIENT_ID,
    redirectUri: window.location.origin,
    scope: 'openid wallet',
  }),
  connectors: { injected, walletconnect },
})

export const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
  [ConnectorNames.BSC]: bscConnector,
  [ConnectorNames.Walletlink]: walletlink,
  [ConnectorNames.Torus]: torus,
  [ConnectorNames.Unstoppable]: uauth,
}

export const getLibrary = (provider: any): Web3Provider => {
  const library = new Web3Provider(provider, 'any')
  library.pollingInterval = 15000
  return library
}
