require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks : {
    hardhat:{
      forking:{
        url:"https://eth-mainnet.g.alchemy.com/v2/2lCA9FpwHLNvo8-oS0TA4dJWQRKhWKcF"
      }
    }
  }
};
