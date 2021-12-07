import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Skeleton } from '@apeswapfinance/uikit'
import { IazoStatus, IazoTimeInfo, IazoTokenInfo } from 'state/types'
import { getBalanceNumber } from 'utils/formatBalance'
import UnlockButton from 'components/UnlockButton'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import getTimePeriods from 'utils/getTimePeriods'
import useFetchUserIazoCommit, { UserCommit } from 'views/Iazos/hooks/useFetchUserIazoCommit'
import Timer from '../../IazoCard/Timer'
import Actions from '../../Actions'
import IazoSymbols from '../../IazoSymbols'
import { BoldAfterTextLarge, Heading } from '../../styles'

interface BeforeSaleProps {
  timeInfo: IazoTimeInfo
  hardcap: string
  baseToken: IazoTokenInfo
  iazoToken: IazoTokenInfo
  status: IazoStatus
  iazoAddress: string
  tokenPrice: string
  liquidityPercent: string
  maxSpend: string
}

const BeforeSaleWrapper = styled.div`
  width: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  ${({ theme }) => theme.mediaQueries.md} {
    width: 796px;
  }
`

const ProgressBarWrapper = styled.div`
  width: 280px;
  margin-top: 15px;
  margin-bottom: 20px;
  border-radius: 20px;
  overflow: hidden;
  ${({ theme }) => theme.mediaQueries.md} {
    width: 557px;
  }
`

const ProgressBar = styled.div`
  height: 18px;
  width: 100%;
  border-radius: 20px;
  background: #c4c4c4;
`

const IazoSymbolsContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  ${({ theme }) => theme.mediaQueries.md} {
    align-items: flex-start;
    justify-content: space-between;
  }
`

const Progress = styled(ProgressBar)<{ percentComplete: string }>`
  width: ${(props) => props.percentComplete};
  background: linear-gradient(53.53deg, #a16552 15.88%, #e1b242 92.56%);
`

const DuringSale: React.FC<BeforeSaleProps> = ({
  timeInfo,
  hardcap,
  baseToken,
  status,
  iazoAddress,
  iazoToken,
  tokenPrice,
  liquidityPercent,
  maxSpend,
}) => {
  const { symbol, decimals } = baseToken
  const { totalBaseCollected, numBuyers } = status
  const { lockPeriod } = timeInfo
  const { account } = useWeb3React()
  const [pendingUserInfo, setPendingUserInfo] = useState(true)
  const { deposited, tokensBought }: UserCommit = useFetchUserIazoCommit(iazoAddress, pendingUserInfo)
  const tokensDepositedFormatted = getBalanceNumber(new BigNumber(deposited), parseInt(decimals))
  const tokensBoughtFormatted = getBalanceNumber(new BigNumber(tokensBought), parseInt(iazoToken.decimals))
  const baseCollectedFormatted = getBalanceNumber(new BigNumber(totalBaseCollected), parseInt(decimals))
  const hardcapFormatted = getBalanceNumber(new BigNumber(hardcap), parseInt(decimals))
  const maxSpendFormatted = getBalanceNumber(new BigNumber(maxSpend), parseInt(decimals))
  const percentRaised = (baseCollectedFormatted / parseFloat(hardcap)) * 100
  const daysLocked = getTimePeriods(parseInt(lockPeriod), true)
  const liquidityPercentFormatted = parseInt(liquidityPercent) / 10

  const onPendingContribute = useCallback((pendingTrx: boolean) => {
    setPendingUserInfo(pendingTrx)
  }, [])

  return (
    <BeforeSaleWrapper>
      <Heading>
        {baseCollectedFormatted.toString() === 'NaN' ? (
          <Skeleton width="200px" height="30px" />
        ) : (
          `${baseCollectedFormatted} / ${hardcapFormatted} ${symbol}`
        )}
      </Heading>
      <ProgressBarWrapper>
        <ProgressBar>
          <Progress percentComplete={`${percentRaised.toString() === 'NaN' ? 0 : percentRaised}%`} />
        </ProgressBar>
      </ProgressBarWrapper>
      <Timer timeInfo={timeInfo} />
      {tokensDepositedFormatted > 0 && (
        <>
          <br />
          <BoldAfterTextLarge boldContent={`${tokensBoughtFormatted.toString()} ${iazoToken.symbol}`}>
            Tokens bought:{' '}
          </BoldAfterTextLarge>
          <BoldAfterTextLarge boldContent={`${tokensDepositedFormatted.toString()} ${symbol}`}>
            Amount contributed:{' '}
          </BoldAfterTextLarge>
        </>
      )}
      {account ? (
        <Actions
          iazoAddress={iazoAddress}
          baseToken={baseToken}
          onPendingContribute={onPendingContribute}
          disabled={percentRaised >= 100 || tokensDepositedFormatted === maxSpendFormatted}
          maxSpendFormatted={maxSpendFormatted}
        />
      ) : (
        <>
          <br />
          <UnlockButton />
          <br />
        </>
      )}
      <IazoSymbolsContainer>
        <IazoSymbols iconImage="dollar" title={`${tokenPrice} ${symbol}`} description="Presale price" />
        <IazoSymbols
          iconImage="lock"
          title={`${liquidityPercentFormatted}%`}
          description={`Locked for ${daysLocked.days} days`}
        />
        <IazoSymbols iconImage="monkey" title={numBuyers} description="Participants" />
      </IazoSymbolsContainer>
    </BeforeSaleWrapper>
  )
}

export default React.memo(DuringSale)
