import { ethers } from 'hardhat'

type DeployAddresses = {
  miraiCoin: string
  miraiCard: string
  miraiMarketplace: string
}

const INITIAL_SUPPLY = 1_000_000_000 // 1B MiraiCoin tokens (before decimals)

async function main(): Promise<DeployAddresses> {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with account:', deployer.address)

  const coinFactory = await ethers.getContractFactory('MiraiCoin')
  const miraiCoin = await coinFactory.deploy(INITIAL_SUPPLY)
  await miraiCoin.waitForDeployment()
  console.log('MiraiCoin deployed to:', await miraiCoin.getAddress())

  const cardFactory = await ethers.getContractFactory('MiraiCard')
  const miraiCard = await cardFactory.deploy()
  await miraiCard.waitForDeployment()
  console.log('MiraiCard deployed to:', await miraiCard.getAddress())

  const marketplaceFactory = await ethers.getContractFactory('MiraiMarketplace')
  const miraiMarketplace = await marketplaceFactory.deploy(
    await miraiCoin.getAddress(),
    await miraiCard.getAddress(),
    deployer.address
  )
  await miraiMarketplace.waitForDeployment()
  console.log('MiraiMarketplace deployed to:', await miraiMarketplace.getAddress())

  return {
    miraiCoin: await miraiCoin.getAddress(),
    miraiCard: await miraiCard.getAddress(),
    miraiMarketplace: await miraiMarketplace.getAddress(),
  }
}

main()
  .then((addresses) => {
    console.log('Deployment successful:', addresses)
  })
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
