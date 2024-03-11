
const hre = require("hardhat");

async function main() {

    // récupération du contrat
    const storage = await hre.ethers.getContractFactory("SimpleStorage");

    // connexion au contrat déployé
    const simpleStorage = storage.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

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


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
