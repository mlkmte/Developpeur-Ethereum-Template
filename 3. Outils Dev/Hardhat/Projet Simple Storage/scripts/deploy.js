
const hre = require("hardhat");

async function main() {

  const value = 10;
  const sendAmount = hre.ethers.parseEther("0.1");

  // avec constructeur paylable
  const simpleStorage = await hre.ethers.deployContract("SimpleStorage",[value],{
    value: sendAmount,
  });

  await simpleStorage.waitForDeployment();
  const address = simpleStorage.target;

  const balance = await hre.ethers.provider.getBalance(address)

  console.log(
    `SimpleStorage deployed to ${address} with balance ${balance.toString()}`
  );


  

  // utiliser la fonction getNumber (retrieve) du contrat déployé
  let number = await simpleStorage.getNombre();
  console.log(
    `Default number ${number.toString()}`
  );


  // utiliser la fonction setNumber du contrat déployé
  await simpleStorage.setNombre(22);
  number = await simpleStorage.getNombre();
  console.log(
    `Updated number ${number.toString()}`
  );






}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
