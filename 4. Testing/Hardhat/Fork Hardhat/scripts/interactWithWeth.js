/* 
Ecrire un script qui permet :
*/
const hre = require("hardhat");

async function main() {
    const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const interfaceName = "IWETH";
    const Weth = await hre.ethers.getContractAt(interfaceName, WETH_ADDRESS)
    
    // De récupérer en local la balance de cette adresse sur le contrat WETH Mainnet.
    // 0xdAE8F0C99f9E233a406647baf3052D5F34e26c86
    let balanceOfAnUser = await Weth.balanceOf('0xdAE8F0C99f9E233a406647baf3052D5F34e26c86');
    console.log(ethers.formatEther(balanceOfAnUser) + 'ETH')

    // Faire un deposit avec un autre compte quelconque (utilisez ethers.getImpersonatedSigner et connect() pour exécuter la fonction "deposit()" avec ce compte en particulier)
    const accountEth = await ethers.getImpersonatedSigner("0x1234567890123456789012345678901234567890");

    let transaction = await Weth.connect(accountEth).deposit({ value: hre.ethers.parseEther('0.1111')})
    await transaction.wait();

    // Récupérer la balance de ce compte quelconque
    balanceOfAnUser = await Weth.balanceOf(accountEth.address);
    console.log(ethers.formatEther(balanceOfAnUser) + 'WETH')

    // Faire un withdraw avec ce même compte de tous les Weth pour récupérer les ETHs
    transaction = await Weth.connect(accountEth).withdraw(balanceOfAnUser)
    await transaction.wait()

    // Récupérer la balance de ce compte quelconque
    balanceOfAnUser = await Weth.balanceOf(accountEth.address);
    console.log(ethers.formatEther(balanceOfAnUser) + 'WETH')
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})